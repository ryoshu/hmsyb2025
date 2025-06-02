import Phaser from 'phaser';

export class PerspectivePipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
    constructor(game) {
        super({
            game,
            fragShader: `
            precision mediump float;
            uniform sampler2D uMainSampler;
            varying vec2 outTexCoord;
            void main(void) {
                float padding = 0.08; // 8% padding on each side, adjust as needed
                float y = outTexCoord.y;
                float perspective = 1.0 - y * 0.7; // 0.7 = tilt amount

                // Remap x to add padding
                float x = padding + (outTexCoord.x * (1.0 - 2.0 * padding));
                vec2 uv = vec2(0.5 + (x - 0.5) * perspective, y);

                vec4 color = texture2D(uMainSampler, uv);
                color.a *= smoothstep(1.0, 0.7, y);
                gl_FragColor = color;
            }
            `
        });
    }
}