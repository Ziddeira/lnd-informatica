# Modelos 3D licenciados (.glb)

Coloque aqui os arquivos `.glb` das peças e registre-os em `data/models3d.ts`.
Sem nenhum arquivo, o site usa o modelo procedural em alta definição.

## Onde conseguir (sempre com licença comercial)
- CGTrader, TurboSquid ou Sketchfab Store: compre com licença "Royalty Free / Standard" que permita uso em site.
- Sketchfab com licença CC-BY 4.0: permitido, desde que o crédito seja preenchido no campo `credit` (aparece no rodapé).
- Fabricantes: alguns disponibilizam modelos para revendedores mediante autorização por escrito.
- NÃO extraia modelos de outros sites (BuildCores, PCPartPicker, lojas etc.) — isso viola direitos autorais e os termos desses sites.

## Recomendações técnicas
- Formato `.glb` (glTF binário), com texturas embutidas, até ~5 MB por peça.
- Comprima com `npx gltf-transform optimize entrada.glb saida.glb --compress meshopt`.
- Não precisa acertar escala nem posição: o site encaixa o modelo automaticamente no espaço da peça.
  Se ficar de lado, ajuste `rotation` (em radianos) no registro.

## Exemplo
```ts
// data/models3d.ts
export const PART_MODELS = {
  "rtx-5080-16": { url: "/models/gpu/rtx-5080.glb", rotation: [0, Math.PI, 0] },
};
export const DEFAULT_MODELS = {
  gpu: { url: "/models/gpu/generica.glb", credit: "“GPU” por Autor — CC-BY 4.0" },
};
```
