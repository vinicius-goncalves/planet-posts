# PlanetPosts

Este projeto, mais voltado para estudos, consiste em posts com o tema sobre o Universo.

### Linguagens utilizadas
- HTML e CSS
- JavaScript

### Frameworks/serviços utilizado 
- Materialize
- Firebase

---

## Tutorial

Para poder testar este projeto, siga os passos:

1. Crie um arquivo **'auth.js'**, dentro da pasta **'js'**;
2. Acesse seu console do Firebase e crie um novo projeto;
3. Faça todas as implementações iniciais básicas;
4. Após isso, dentro do arquivo 'auth.js', adicione as configurações fornecidas no projeto do firebase e outras configurações como mostrado abaixo:

```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js"
import { getStorage } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-storage.js"

const firebaseConfig = {
    //Data fornecida no projeto do firebase. Caso tenha dúvidas sobre como fazer essa implementação,
    //basta acessar a documentação do Firebase para saber mais.
    // ------ https://firebase.google.com/docs/build
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

```

> Projeto sob licensa [GPL v3.](LICENSE.md)
