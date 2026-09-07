# RockGrid

## Relato do desenvolvimento

O RockGrid está sendo reorganizado para guardar os dados por banda. A ideia é separar os fatos sobre cada banda das regras usadas para montar o tabuleiro.

Antes, cada característica continha uma lista própria de bandas. Isso fazia o mesmo nome aparecer em vários lugares e tornava a manutenção mais sujeita a erros. Na nova estrutura, uma banda é cadastrada uma vez e as características apenas consultam seus campos.

## Organização dos arquivos

- `bands.json`: cadastro das bandas e seus dados.
- `caracteristicas.json`: regras que podem aparecer nas linhas e colunas do grid.
- `estrutura-logica.js`: esquema com esboço de funções que avaliam as regras e calculam as interseções.
- `script.js`: lógica da interface, seleção das características, respostas e contagem de palpites.
- `index.html`: estrutura da página.
- `styles.css`: aparência do jogo.

## Como executar localmente

Os arquivos JSON são carregados pelo JavaScript usando `fetch`. Por isso, o jogo deve ser aberto por um servidor HTTP local, e não diretamente pelo Explorer com um endereço `file://`.

### Usando Python

Abra o terminal na pasta principal do projeto, `RockGrid`, e execute:

```bash
python -m http.server 8000
```

Com o servidor em execução, abra o jogo neste endereço:

```text
http://localhost:8000
```


Para visualizar alterações, salve os arquivos e atualize a página no navegador. Para interromper o servidor, volte ao terminal e pressione `Ctrl+C`.

### Usando o Live Server do VS Code

Com a extensão **Live Server** instalada:

1. Abra `index.html`.
2. Clique com o botão direito no arquivo.
3. Selecione **Open with Live Server**.

O VS Code abrirá uma URL semelhante a:

```text
http://127.0.0.1:5500/index.html
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

  (...)
}
```

O `id` identifica a banda internamente, enquanto `nome` é o texto mostrado ao jogador. Os demais campos representam fatos que podem ser usados nas regras do jogo, como país, ano de formação, gêneros, integrantes e quantidade de discos.

A identidade interna do dado deve ser feita através do `id` e não usando o nome da banda. Como o nome da banda pode sofrer alteração ("The Beatles" para "Beatles"), isso poderia quebrar o código e dificultaria a manutenção.

## Lista de características

Atualmente a lista de características usada é:

- País de origem
- Ano de formação
- Gêneros musicais
- Integrantes
- Quantidade de discos de inéditas
- Vocalistas
- Vocalistas também são guitarristas
- Vocalistas também são baixistas
- Vocalistas também são tecladistas
- Vocalistas também são bateristas
- Separou e voltou
- Nome da banda é um animal
- Nome da banda é um lugar
- Integrantes tem carreira solo
- Formação mista
- Já ganhou um Grammy
- Integrantes tem/tiveram relacionamento romântico entre sí
- Integrantes são parentes

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
- o jogador tenha um limite de 12 palpites;
- a resposta seja validada contra a interseção entre linha e coluna;
- os dados exibidos ao jogador usem `nome`, e não necessariamente o `id` interno;
- caso a resposta esteja errada, a célula selecionada precisa mostrar isso através de mensagem ou comportamento;
- respostas erradas podem ser novamente usadas em outras células;
- se o jogador completar o grid com nove respostas corretas dentro das 12 tentativas ele vence o jogo;
- caso o jogador vença, o jogo deve mostrar isso através de mensagem e comportamento; 

## Estado atual

A separação dos dados e a lógica de consulta já estão representadas em `bands.json`, `caracteristicas.json` e `estrutura-logica.js`.

O código em `script.js` já realiza as seguintes ações:

1. carrega a base de dados das bandas (`bands.json`);
1. carrega a base de dados com as características das bandas (`caracteristicas.json`);
1. embaralha e seleciona dados para serem inseridas nas células de características (`selectValidCharacteristics()`);
1. cria o grid central do jogo, inserindo células de características na região correta (`createGrid()`);
1. seleciona e verifica se a interseção das questões possuem ao menos uma resposta válida;
1. criar lógica que selecione bandas de acordo com a característica sorteada;
1. filtra as questões para que cada interseção possua, no mínimo, uma resposta possível;
1. usar `getIntersectionBands` na validação das respostas;

## Próximos passos

A integração completa ainda precisa ser concluída no fluxo principal do jogo. Atualmente, a página carrega `script.js`, que ainda deve ser ajustado para:

1. estudar integração com a api do [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API);
1. terminar a implementação do modal de respostas;
1. transformar as bandas em um formato único usado pela lógica;
1. criar um sistema de pontuação para o jogo;

Também é importante manter todos os nomes dos campos consistentes. Por exemplo, se uma característica usar `valor: "Rock alternativo"`, o valor correspondente precisa existir exatamente no campo `generos` da banda, ou a comparação deve ser normalizada de forma explícita.

## Benefícios da nova abordagem

- reduz a duplicação de nomes;
- facilita corrigir ou atualizar os dados de uma banda;
- permite criar novas características sem editar várias listas;
- torna as regras reutilizáveis;
- facilita adicionar informações futuras, como gravadoras, integrantes, prêmios e períodos de atividade;
- deixa a lógica do jogo independente da forma como os dados foram cadastrados.

Esta estrutura cria uma base mais flexível para evoluir o RockGrid sem transformar cada nova regra em uma alteração manual espalhada pelo projeto.