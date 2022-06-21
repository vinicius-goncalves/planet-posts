import { db, auth, storage } from './auth.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js"
import { setDoc, doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js"
import { ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-storage.js"

const registerAccountForm = document.querySelector('#register-modal')
const loginAccountForm = document.querySelector('#login-modal')
const createNewPostContainer = document.querySelector('#create-new-post')

const navbar = document.querySelectorAll('[data-js="nav-bar"]')

onAuthStateChanged(auth, async (user) => {
    if(user) {
        setupNavbar(user)
    }else {
        setupNavbar(user)
    }
})

function UserDetails(email, password) {
    this.email = email
    this.password = password
}

const setupNavbar = (user) => {
    const eachNavBar = [...navbar]
    eachNavBar.forEach(navbar => {
        navbar.style.display = 'block'
        const childrenNavbar = [...navbar.children]
        childrenNavbar.forEach(li => {
            const result = li.dataset.js.includes(user ? 'logged-in' : 'logged-out')
            if(result) {
                li.style.display = 'block'
                return
            }
            li.style.display = 'none'

        })
    })
}

navbar.forEach(navbar => {
    navbar.addEventListener('click', (event) => {
        if(event.target.dataset.target === "login-modal") {
            if(localStorage.getItem('userdetails')) {
                const x = JSON.parse(localStorage.getItem('userdetails'))
                signInWithEmailAndPassword(auth, x.email, x.password).then(() => {
                    window.location.reload()
                })
            }
        }

        if(event.target.dataset.js === "loggout-button") {
            signOut(auth)
        }
    })
})

registerAccountForm.addEventListener('submit', (event) => {
    event.preventDefault()
    
    const email = event.target.email.value
    const username = event.target.username.value
    const password = event.target.password.value

    createUserWithEmailAndPassword(auth, email, password).then(() => {
        return updateProfile(auth.currentUser, {
            displayName: username
        }).then(() => console.log('Updated'))
    })
})

loginAccountForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const email = event.target.email.value
    const password = event.target.password.value

    if(event.target.remember.checked) {
        const userLocal = new UserDetails(email, password)
        localStorage.setItem('userdetails', JSON.stringify(userLocal, null, 2))
        console.log(localStorage.getItem('userdetails'))
        
    }

    signInWithEmailAndPassword(auth, email, password).then(() => {
        console.log('Logged in')
        window.location.reload()

    })
}) 

const randomCharacters = (length, characters) => {
    let result = ""
    const charactersLength = characters.length
    for(let i = 0; i < length; i++) {
        result += characters.charAt(Math.random() * charactersLength)
    }
    return result
}

createNewPostContainer.addEventListener('click', async event => {

    const idGenerated = randomCharacters(5, '12345')

    const postTitle = createNewPostContainer.querySelector('[name="post_title"]')
    const postDescription = createNewPostContainer.querySelector('[name="post_description"]')
    if(event.target.dataset.js === "create-post") {
        getDoc(doc(db, "users_posts", auth.currentUser.uid)).then(a => {
            if(a.exists()) {
                updateDoc(doc(db, "users_posts", auth.currentUser.uid), {
                    [`posts.${idGenerated}`]: ['img', `${postTitle.value}`, `${postDescription.value}`]
                })
            }else {
                setDoc(doc(db, "users_posts", auth.currentUser.uid), {
                    userUid: auth.currentUser.uid,
                    posts: {}
                }).then(() => console.log('Sucesso'))
            }
        })
    }
})

const desktopItems = document.querySelector('.desktop-items') 

setTimeout(() => {
    onSnapshot(doc(db, "users_posts", auth.currentUser.uid), doc => {
        desktopItems.innerHTML = ""
        if(doc.data().posts !== undefined) {
            const post = Object.values(doc.data().posts)
            const arrays = post.map(array => array)
            for(let i in arrays) {
                let img, title, description = null
                for(let _ in arrays[i]) {
                    const [x, y, z] = arrays[i]
                    img = x
                    title = y
                    description = z
                }

                desktopItems.innerHTML += 
                    `<div class="col s6">
                        <div class="card">
                            <div class="card-image">
                                <img src="images/first-image.jpg" class="responsive-image">
                                <span class="card-title">${title}</span>
                                <a class="btn-floating halfway-fab purple waves-effect activator right tooltipped" data-position="right" data-tooltip="More details"><i class="material-icons">info</i></a>
                            </div>
                            <div class="card-content">
                                <p>${description}</p>
                                <div class="chip" style="margin-top: 10px;">
                                    <img src="images/user-photo.jpg" alt="">
                                    <span>Posted by gonssalviz</span>
                                </div>
                            </div>

                            <div class="card-reveal">
                                <span class="card-title"><i class="material-icons">close</i></span>
                                <h5>Lorem, ipsum dolor.</h5>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, nisi facilis? Accusamus velit quas omnis? Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam minus cupiditate nemo quas nihil eius?</p>

                                <div class="chip">
                                    <img src="images/user-photo.jpg" alt="">
                                    <span>Posted by gonssalviz</span>
                                </div>

                                <a href="#" class="btn purple lighten-1 waves-effect" style="display: block; margin-top: 10px;"><i class="material-icons left">thumb_up</i>I liked it</a>
                            </div>

                        </div>
                    </div>`
            }
        }else {
            console.log('Retornado')
            return
        }
    })
}, 2000)