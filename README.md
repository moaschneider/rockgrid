# RockGrid

## Relato do desenvolvimento

O RockGrid está sendo reorganizado para guardar os dados por banda. A ideia é separar os fatos sobre cada banda das regras usadas para montar o tabuleiro.

Antes, cada característica continha uma lista própria de bandas. Isso fazia o mesmo nome aparecer em vários lugares e tornava a manutenção mais sujeita a erros. Na nova estrutura, uma banda é cadastrada uma vez e as características apenas consultam seus campos.

## Organização dos arquivos

- `bands.json`: cadastro das bandas e seus dados.
- `caracteristicas.json`: regras que podem aparecer nas linhas e colunas do grid.
- `estrutura-logica.js`: funções que avaliam as regras e calculam as interseções.
- `rockgrid-game.js`: lógica da interface, seleção das características, respostas e contagem de palpites.
- `rockgrid.html`: estrutura da página.
- `rockgrid-styles.css`: aparência do jogo.

## Como executar localmente

Os arquivos JSON são carregados pelo JavaScript usando `fetch`. Por isso, o jogo deve ser aberto por um servidor HTTP local, e não diretamente pelo Explorer com um endereço `file://`.

### Usando Python

Abra o terminal na pasta principal do projeto, `BrazaGrid`, e execute:

```bash
python -m http.server 8000
```

Com o servidor em execução, abra o jogo neste endereço:

```text
http://localhost:8000/rockgrid/rockgrid.html
```

Se o terminal estiver aberto diretamente dentro da pasta `rockgrid`, use o mesmo comando:

```bash
python -m http.server 8000
```

Nesse caso, o endereço será:

```text
http://localhost:8000/rockgrid.html
```

Para visualizar alterações, salve os arquivos e atualize a página no navegador. Para interromper o servidor, volte ao terminal e pressione `Ctrl+C`.

### Usando o Live Server do VS Code

Com a extensão **Live Server** instalada:

1. Abra `rockgrid.html` dentro da pasta `rockgrid`.
2. Clique com o botão direito no arquivo.
3. Selecione **Open with Live Server**.

O VS Code abrirá uma URL semelhante a:

```text
http://127.0.0.1:5500/rockgrid/rockgrid.html
```

O número da porta pode variar. O endereço exato aparece no navegador e no terminal do VS Code.

## Dados por banda

O arquivo `bands.json` usa uma lista de objetos. Cada banda possui um identificador, um nome e seus atributos:

```json
{
  "id": "beatles",
  "nome": "The Beatles",
  "pais": "Reino Unido",
  "anoFormacao": 1960,
  "generos": ["Rock", "Pop rock"],
  "quantidadeDiscosEstudio": 13,
  "vocalistas": ["John Lennon", "Paul McCartney"],
  "vocalistasTambemGuitarristas": true
}
```

O `id` identifica a banda internamente, enquanto `nome` é o texto mostrado ao jogador. Os demais campos representam fatos que podem ser usados nas regras do jogo, como país, ano de formação, gêneros, integrantes e quantidade de discos.

A lista é preferível a usar diretamente o nome da banda como chave porque o `id` permanece estável mesmo que a forma de exibição do nome seja ajustada.

## Características como regras

O arquivo `caracteristicas.json` não precisa repetir nomes de bandas. Cada item informa o texto apresentado no grid e como a regra deve consultar os dados:

```json
{
  "id": "banda_britanica",
  "texto": "Banda britânica",
  "campo": "pais",
  "valor": "Reino Unido"
}
```

Para regras numéricas, podem ser usados limites:

```json
{
  "id": "mais_de_10_discos",
  "texto": "Banda com mais de 10 discos de estúdio",
  "campo": "quantidadeDiscosEstudio",
  "min": 11
}
```

Uma característica de gênero pode consultar um campo que contém uma lista:

```json
{
  "id": "rock_alternativo",
  "texto": "Banda de rock alternativo",
  "campo": "generos",
  "valor": "Alternativo"
}
```

## Como a lógica funciona

A função `bandaAtendeCaracteristica` recebe uma banda e uma característica. Ela:

1. Lê o campo indicado por `caracteristica.campo`.
2. Usa `includes` quando o campo é uma lista, como `generos`.
3. Compara os limites `min` e `max` quando a regra é numérica.
4. Faz uma comparação direta nos demais casos.

Exemplo conceitual:

```javascript
bandaAtendeCaracteristica(beatles, {
  campo: "pais",
  valor: "Reino Unido"
});
// true
```

A função `getBandsForCharacteristic` percorre todas as bandas e retorna somente as que atendem à regra. Por exemplo, a característica `banda_britanica` retornaria `The Beatles` quando os dados dessa banda indicarem `pais: "Reino Unido"`.

## Interseção do grid

Cada célula é formada por uma característica de linha e uma característica de coluna. A resposta correta é uma banda que pertence às duas listas ao mesmo tempo.

Exemplo:

- Linha: `Banda britânica`
- Coluna: `Formada nos anos 1960`
- Interseção: bandas britânicas formadas entre 1960 e 1969

A lógica faz isso em duas etapas:

```javascript
const bandasDaLinha = getBandsForCharacteristic(caracteristicaDaLinha);
const bandasDaColuna = getBandsForCharacteristic(caracteristicaDaColuna);

const respostas = bandasDaColuna.filter(banda =>
  bandasDaLinha.includes(banda)
);
```

No arquivo `estrutura-logica.js`, a lista da primeira característica é convertida em `Set` para tornar a consulta da interseção mais eficiente.

## Regras do jogo

A implementação prevê que:

- uma banda não seja reutilizada em outra célula;
- características sem interseção não sejam escolhidas para o tabuleiro;
- o jogador tenha um limite de palpites;
- a resposta seja validada contra a interseção entre linha e coluna;
- os dados exibidos ao jogador usem `nome`, e não necessariamente o `id` interno.

## Estado atual e próximos passos

A separação dos dados e a lógica de consulta já estão representadas em `bands.json`, `caracteristicas.json` e `estrutura-logica.js`.

A integração completa ainda precisa ser concluída no fluxo principal do jogo. Atualmente, a página carrega `rockgrid-game.js`, que ainda deve ser ajustado para:

1. carregar `bands.json` e `caracteristicas.json`;
2. transformar as bandas em um formato único usado pela lógica;
3. trocar as referências antigas a estados por bandas;
4. usar `getIntersectionBands` na validação das respostas;
5. mostrar o nome da banda no grid e no campo de resposta.

Também é importante manter todos os nomes dos campos consistentes. Por exemplo, se uma característica usar `valor: "Rock alternativo"`, o valor correspondente precisa existir exatamente no campo `generos` da banda, ou a comparação deve ser normalizada de forma explícita.

## Benefícios da nova abordagem

- reduz a duplicação de nomes;
- facilita corrigir ou atualizar os dados de uma banda;
- permite criar novas características sem editar várias listas;
- torna as regras reutilizáveis;
- facilita adicionar informações futuras, como gravadoras, integrantes, prêmios e períodos de atividade;
- deixa a lógica do jogo independente da forma como os dados foram cadastrados.

Esta estrutura cria uma base mais flexível para evoluir o RockGrid sem transformar cada nova regra em uma alteração manual espalhada pelo projeto.
