/// <reference types="@figma/plugin-typings" />

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 300 });

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface DesignInstruction {
  type: string;
  properties: {
    [key: string]: any;
  };
  children?: DesignInstruction[];
}

interface Config {
  apiKey: string;
}

let config: Config = {
  apiKey: process.env.OPENAI_API_KEY || ''
};

// Load saved API key if it exists
figma.clientStorage.getAsync('openai-api-key').then(savedKey => {
  if (savedKey) {
    config.apiKey = savedKey;
    // Hide the API key input if we have a saved key
    figma.ui.postMessage({ type: 'hide-api-key' });
  }
});

async function callOpenAI(prompt: string): Promise<DesignInstruction[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        model: "gpt-4-1106-preview",
        messages: [{
          role: "system",
          content: `You are a Figma design assistant that creates detailed UI designs. For each request:
            1. Create a parent frame with auto-layout
            2. Add specific styles (colors, shadows, padding)
            3. Include proper spacing between elements
            4. Use modern UI patterns

            Available elements and properties:
            {
              "type": "frame",
              "properties": {
                "name": string,
                "layoutMode": "HORIZONTAL" | "VERTICAL",
                "primaryAxisSizingMode": "AUTO" | "FIXED",
                "counterAxisSizingMode": "AUTO" | "FIXED",
                "width": number,
                "height": number,
                "padding": { "top": number, "right": number, "bottom": number, "left": number },
                "itemSpacing": number,
                "fills": [{ "type": "SOLID", "color": { "r": number, "g": number, "b": number }, "opacity": number }],
                "cornerRadius": number,
                "effects": [{
                  "type": "DROP_SHADOW",
                  "color": { "r": number, "g": number, "b": number, "a": number },
                  "offset": { "x": number, "y": number },
                  "radius": number,
                  "spread": number
                }]
              }
            }

            Always include these properties for text:
            {
              "type": "text",
              "properties": {
                "characters": string,
                "fontSize": number,
                "fontName": { "family": "Inter", "style": "Regular" | "Medium" | "Bold" },
                "fills": [{ "type": "SOLID", "color": { "r": number, "g": number, "b": number } }],
                "textAlignHorizontal": "LEFT" | "CENTER" | "RIGHT"
              }
            }

            For buttons and interactive elements:
            {
              "type": "rectangle",
              "properties": {
                "name": string,
                "cornerRadius": number,
                "fills": [{ "type": "SOLID", "color": { "r": number, "g": number, "b": number } }],
                "width": number,
                "height": number
              }
            }

            Example response format:
            {
              "elements": [
                {
                  "type": "frame",
                  "properties": {
                    "name": "Card",
                    "layoutMode": "VERTICAL",
                    "primaryAxisSizingMode": "AUTO",
                    "counterAxisSizingMode": "AUTO",
                    "padding": { "top": 24, "right": 24, "bottom": 24, "left": 24 },
                    "itemSpacing": 16,
                    "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }],
                    "cornerRadius": 8,
                    "effects": [{
                      "type": "DROP_SHADOW",
                      "color": { "r": 0, "g": 0, "b": 0, "a": 0.1 },
                      "offset": { "x": 0, "y": 2 },
                      "radius": 8,
                      "spread": 0
                    }]
                  },
                  "children": [
                    {
                      "type": "text",
                      "properties": {
                        "characters": "Welcome back",
                        "fontSize": 24,
                        "fontName": { "family": "Inter", "style": "Bold" },
                        "fills": [{ "type": "SOLID", "color": { "r": 0.1, "g": 0.1, "b": 0.1 } }]
                      }
                    }
                  ]
                }
              ]
            }`
        }, {
          role: "user",
          content: prompt
        }],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data: OpenAIResponse = await response.json();
    const parsedResponse = JSON.parse(data.choices[0].message.content);
    return parsedResponse.elements || [];
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate design instructions');
  }
}

async function createDesignElement(instruction: DesignInstruction, parent?: FrameNode) {
  let node;

  switch (instruction.type.toLowerCase()) {
    case 'rectangle':
      node = figma.createRectangle();
      break;
    case 'text':
      node = figma.createText();
      if (instruction.properties.fontName) {
        await figma.loadFontAsync(instruction.properties.fontName);
      } else {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      }
      break;
    case 'frame':
      node = figma.createFrame();
      break;
    case 'ellipse':
      node = figma.createEllipse();
      break;
    case 'line':
      node = figma.createLine();
      break;
    case 'component':
      node = figma.createComponent();
      break;
    default:
      return null;
  }

  // Apply properties
  Object.entries(instruction.properties).forEach(([key, value]) => {
    if (node.hasOwnProperty(key)) {
      (node as any)[key] = value;
    }
  });

  // Handle children if they exist
  if (instruction.children && node.type === 'FRAME') {
    for (const child of instruction.children) {
      const childNode = await createDesignElement(child, node as FrameNode);
      if (childNode) {
        (node as FrameNode).appendChild(childNode);
      }
    }
  }

  // Add to parent if provided
  if (parent) {
    parent.appendChild(node);
  }

  return node;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'set-api-key') {
    config.apiKey = msg.apiKey;
    figma.clientStorage.setAsync('openai-api-key', msg.apiKey);
  }
  else if (msg.type === 'generate-design') {
    try {
      const instructions = await callOpenAI(msg.prompt);

      // Create a frame with better defaults
      const frame = figma.createFrame();
      frame.name = "Generated Design";
      frame.layoutMode = "VERTICAL";
      frame.primaryAxisSizingMode = "AUTO";
      frame.counterAxisSizingMode = "AUTO";
      frame.paddingLeft = 32;
      frame.paddingRight = 32;
      frame.paddingTop = 32;
      frame.paddingBottom = 32;
      frame.itemSpacing = 24;
      frame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];

      // Create each design element
      for (const instruction of instructions) {
        const element = await createDesignElement(instruction);
        if (element) {
          frame.appendChild(element);
        }
      }

      figma.viewport.scrollAndZoomIntoView([frame]);
      figma.ui.postMessage({ type: 'success' });
    } catch (error: any) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: error.message || 'Failed to generate design' 
      });
    }
  }
}; 