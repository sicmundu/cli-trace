import React, { useState } from 'react';
import { Trace } from '@cli-trace/renderer-react';
import { TraceSource } from '@cli-trace/core';
import styled from 'styled-components';

// Sample SVG paths for demo - using simple absolute coordinates
const SAMPLE_SVGS = {
  heart: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20 L35 35 L25 30 L30 45 L15 60 L35 55 L50 75 L65 55 L85 60 L70 45 L75 30 L65 35 Z" fill="none" stroke="#ff0000" stroke-width="2"/>
  </svg>`,

  star: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L61 35 L88 35 L69 54 L75 81 L50 66 L25 81 L31 54 L12 35 L39 35 Z" fill="none" stroke="#ffd700" stroke-width="2"/>
  </svg>`,

  circle: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="#00ff00" stroke-width="3"/>
  </svg>`,

  wave: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 L30 20 L50 50 L70 80 L90 50 L110 20 L130 50 L150 80 L170 50 L190 20" fill="none" stroke="#0088ff" stroke-width="3"/>
  </svg>`,
};

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
  color: white;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
`;

const Controls = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const ControlRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  min-width: 120px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 100px;
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.variant === 'primary' ? '#007bff' : '#6c757d'};
  color: white;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#0056b3' : '#545b62'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PreviewContainer = styled.div`
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #ffffff;
`;

const TraceWrapper = styled.div`
  border: 2px dashed #dee2e6;
  border-radius: 10px;
  padding: 20px;
  background: #f8f9fa;
`;

const InfoSection = styled.div`
  padding: 30px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const InfoTitle = styled.h2`
  color: #495057;
  margin-bottom: 20px;
`;

const CodeBlock = styled.pre`
  background: #2d3748;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const App: React.FC = () => {
  const [selectedShape, setSelectedShape] = useState<keyof typeof SAMPLE_SVGS>('heart');
  const [duration, setDuration] = useState(2000);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [loop, setLoop] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [renderer, setRenderer] = useState<'svg' | 'canvas'>('svg');

  const source: TraceSource = {
    svg: SAMPLE_SVGS[selectedShape],
  };

  const handleReset = () => {
    // Force re-render by changing key
    setSelectedShape(selectedShape);
  };

  const generateCodeExample = () => {
    if (renderer === 'svg') {
      return `import { Trace } from '@cli-trace/renderer-react';

<Trace
  source={{ svg: \`${SAMPLE_SVGS[selectedShape].replace(/`/g, '\\`')}\` }}
  options={{
    durationMs: ${duration},
    loop: ${loop},
  }}
  width={400}
  height={300}
  strokeColor="${strokeColor}"
  backgroundColor="${backgroundColor}"
  strokeWidth={${strokeWidth}}
  autoPlay={${autoPlay}}
/>`;
    } else {
      return `import { useTrace } from '@cli-trace/renderer-react';

const { progress, isPlaying, play, stop } = useTrace({
  source: { svg: \`${SAMPLE_SVGS[selectedShape].replace(/`/g, '\\`')}\` },
  duration: ${duration},
  loop: ${loop},
  renderer: 'canvas',
  width: 400,
  height: 300,
});`;
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title>CLI-Trace Demo</Title>
        <Subtitle>Interactive SVG stroke animation playground</Subtitle>
      </Header>

      <DemoContainer>
        <Controls>
          <ControlRow>
            <ControlGroup>
              <Label>Shape</Label>
              <Select
                value={selectedShape}
                onChange={(e) => setSelectedShape(e.target.value as keyof typeof SAMPLE_SVGS)}
              >
                <option value="heart">Heart</option>
                <option value="star">Star</option>
                <option value="circle">Circle</option>
                <option value="wave">Wave</option>
              </Select>
            </ControlGroup>

            <ControlGroup>
              <Label>Renderer</Label>
              <Select
                value={renderer}
                onChange={(e) => setRenderer(e.target.value as 'svg' | 'canvas')}
              >
                <option value="svg">SVG</option>
                <option value="canvas">Canvas</option>
              </Select>
            </ControlGroup>

            <ControlGroup>
              <Label>Duration (ms)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="500"
                max="10000"
                step="100"
              />
            </ControlGroup>

            <ControlGroup>
              <Label>Stroke Width</Label>
              <Input
                type="number"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                min="1"
                max="10"
                step="0.5"
              />
            </ControlGroup>
          </ControlRow>

          <ControlRow>
            <ControlGroup>
              <Label>Stroke Color</Label>
              <Input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
              />
            </ControlGroup>

            <ControlGroup>
              <Label>Background</Label>
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </ControlGroup>

            <ControlGroup>
              <Label>
                <Checkbox
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                />
                Loop
              </Label>
            </ControlGroup>

            <ControlGroup>
              <Label>
                <Checkbox
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                />
                Auto Play
              </Label>
            </ControlGroup>

            <Button onClick={handleReset}>Reset Animation</Button>
          </ControlRow>
        </Controls>

        <PreviewContainer>
          <TraceWrapper>
            <Trace
              source={source}
              options={{
                durationMs: duration,
                loop,
              }}
              renderer={renderer}
              width={400}
              height={300}
              strokeColor={strokeColor}
              backgroundColor={backgroundColor}
              strokeWidth={strokeWidth}
              autoPlay={autoPlay}
            />
          </TraceWrapper>
        </PreviewContainer>

        <InfoSection>
          <InfoTitle>Usage Example</InfoTitle>
          <CodeBlock>{generateCodeExample()}</CodeBlock>
        </InfoSection>
      </DemoContainer>
    </AppContainer>
  );
};

export default App;
