import { db, auth, storage } from './auth'
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    updateProfile, 
    signOut } from "firebase-auth"
import { setDoc, doc, getDoc, updateDoc, onSnapshot } from "firebase-firestore"
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase-storage"

const registerAccountForm = document.querySelector('#register-modal')
const loginAccountForm = document.querySelector('#login-modal')
const createNewPostContainer = document.querySelector('#create-new-post')
const imageSendInput = document.querySelector('#image-send-input')

const desktopItems = document.querySelector('.desktop-items') 

const newAccountPictureSection = document.querySelector('.image-section')
const inputNewFile = document.querySelector('#send-image-profile')


const navbar = document.querySelectorAll('[data-js="nav-bar"]')

onAuthStateChanged(auth, async (user) => {
    if(user) {
        setupNavbar(user)
    }else {
        setupNavbar(user)
    }
})


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
                                <img src="${img}">
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

function userDetails(email, password) {
    this.email = email 
    this.password = password
}

loginAccountForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const email = event.target.email.value
    const password = event.target.password.value

    if(event.target.remember.checked) {
        const userLocal = new userDetails(email, password)
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

    const postImage = imageSendInput.files[0]
    const postTitle = createNewPostContainer.querySelector('[name="post_title"]')
    const postDescription = createNewPostContainer.querySelector('[name="post_description"]')

    // if(postTitle.value === '' || postDescription.value === '') {
    //     console.log('Insira um valor antes')
    //     return
    // }

    const generateNewId = randomCharacters(6, 'ABCDE123450')
    
    if(event.target.id === "generate-lorem-button"){
        postTitle.value = "Lorem ipsum dolor sit amet."
        postDescription.value = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora, libero!"
    }

    if(event.target.dataset.js === "create-post") {
        getDoc(doc(db, "users_posts", auth.currentUser.uid)).then(async documentReference => {
            if(documentReference.exists()) {
                const progressDOM = document.querySelector('.determinate')
                const storageReference = ref(storage, 'images_posts/'+postImage.name)

                const imageReference = uploadBytesResumable(storageReference, postImage)
                const newElement = document.createElement('span')
                document.querySelector('[data-js="create-post"]').parentElement.classList.add('disabled')
                
                imageReference.on('state_changed', (imageSnapshot) => {
                    const percentage = Math.floor((imageSnapshot.bytesTransferred / imageSnapshot.totalBytes) * 100)
                    newElement.textContent = percentage + "%"
                    progressDOM.parentElement.insertAdjacentElement('afterend', newElement)
                    progressDOM.style.width = percentage + '%'
                }, (error) => {
                    console.log(error)
                }, async () => {
                    const image = await getDownloadURL(ref(storage, imageReference._metadata.fullPath))
                    updateDoc(doc(db, "users_posts", auth.currentUser.uid), {
                        [`posts.${generateNewId}`]: [image, `${postTitle.value}`, `${postDescription.value}`]
                    })
                    postTitle.value = ""
                    postDescription.value = ""
                    postImage.value = ""
                    progressDOM.style.width = "0"
                    document.querySelector('.file-path').value = ""
                    newElement.textContent = "Posted!"
                    
                    document.documentElement.scrollTop = document.documentElement.scrollHeight - document.documentElement.scrollTop
                    document.querySelector('[data-js="create-post"]').parentElement.classList.remove('disabled')

                    let i = 5
                    let interval = null
                    interval = setInterval(() => {
                        console.log(interval)
                        i--
                        newElement.textContent = "Posted! Closed in: " + i
                        
                        if(i === 1 && interval != null) {
                            newElement.remove()
                            M.Modal.getInstance(document.querySelector('#create-new-post')).close()
                            clearInterval(interval)
                        }

                    }, 1000)

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

newAccountPictureSection.addEventListener('click', () => {
    inputNewFile.click()
    console.log(auth)
})

const validFiles = ['jpg', 'jpeg', 'png', 'gif']

inputNewFile.addEventListener('change', async (event) => {
    const photo = event.target.files[0]
    const photoType = photo.type.replace('image/', '')
    if(!validFiles.includes(photoType)) {
        console.log('Please, input a value that is: ' + validFiles.join(', '))
        return
    }

    const blob = new Blob([photo], { type: 'image/' + photoType})
    const url = URL.createObjectURL(photo)
    const pictureProfileReference = ref(storage, 'users_profile_picture/'+photo.name)
    const resultTask = await uploadBytes(pictureProfileReference, photo)
    const fileToDownload = await getDownloadURL(pictureProfileReference, resultTask.metadata.fullPath)
    // updateProfile(auth, {
    //     photoURL
    // })
    
    document.querySelector('.user-logo').src = url
})