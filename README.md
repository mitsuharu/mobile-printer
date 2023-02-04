名刺レシート印刷アプリ for SUNMI V2 PRO
==

業務用端末 SUNMI V2 PRO を使用したレシート型名刺を印刷するアプリです。

## Demo

[![動作デモ動画](README_Images/thumbnail.png)](https://www.youtube.com/watch?v=s9HNWSZ2Gbo)


### 印刷結果

![印刷結果](README_Images/receipts.png)

## Develop

### requirements

- GMSが有効な [SUNMI V2 PRO](https://www.sunmi.com/ja/v2-pro/) [^requirements-others]

[^requirements-others]: V2 や V1s でも動作するようです

### frameworks

- React Native 0.71.2

### architectures

- Redux Saga

### build

```shell
yarn
yarn android
```

### release

```shell
cd ./android
./gradlew assembleRelease
```

## Features

- 印刷データはアプリ内で追加・編集できます
  - UI は鮮麗されていません
- 画像は端末内のライブラリから選択可能です
  - 事前に白黒加工をするのがおすすめです
 
## TODO

- CI
- ストアでの公開？

## License

MIT

## Link

- [名刺を印刷するスマホアプリを作った \- Qiita](https://qiita.com/mitsuharu_e/items/2aeb060c6934e763b6c0)
- [SUNMI V2 PRO を入手した iOS アプリエンジニアが頑張る話 \- Speaker Deck](https://speakerdeck.com/mitsuharu/kyotolt-20221209)
