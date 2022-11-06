名刺レシート印刷アプリ for Sunmi V2 Pro
==

業務向け端末 Sunmi V2 Pro を使用したレシート型名刺を印刷するアプリです。

## Demo

[![動作デモ動画](README_Images/thumbnail.png)](https://www.youtube.com/watch?v=s9HNWSZ2Gbo)


### 印刷結果

![印刷結果](README_Images/receipts.png)

## Develop

### requirements

- GMSが有効な [Sunmi V2 Pro](https://www.sunmi.com/ja/v2-pro/)

### frameworks

- React Native 0.70.x


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
- Dependabot
- ストアでの公開？

## License

MIT