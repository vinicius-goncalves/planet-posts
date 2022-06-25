import { db, auth, storage } from './auth.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js"
import { setDoc, doc, getDoc, getDocs, updateDoc, collection, query, onSnapshot } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js"
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-storage.js"

const registerAccountForm = document.querySelector('#register-modal')
const loginAccountForm = document.querySelector('#login-modal')
const createNewPostContainer = document.querySelector('#create-new-post')
const imageSendInput = document.querySelector('#image-send-input')

const desktopItems = document.querySelector('.desktop-items') 
const mobileItems = document.querySelector('.mobile-items')

const newAccountPictureSection = document.querySelector('.image-section')
const inputNewFile = document.querySelector('#send-image-profile')
const userProfilePicture = document.querySelector('.user-logo')

const navbar = document.querySelectorAll('[data-js="nav-bar"]')

let userUid = null

onAuthStateChanged(auth, async (user) => {
    if(user) {
        setupNavbar(user)
        userProfilePicture.src = auth.currentUser.photoURL || userProfilePicture.src
        updateDetails()
        userUid = user.uid
    }else {
        setupNavbar(user)
    }
})

const updateDetails = () => {
    onSnapshot(doc(db, "users_posts", auth.currentUser.uid), doc => {
        desktopItems.innerHTML = ""
        if(doc.data().posts !== undefined) {
            const { pictureProfile, username } = doc.data()
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
                                    <img src="${pictureProfile}" alt="">
                                    <span>Posted by ${username}</span>
                                </div>
                            </div>

                            <div class="card-reveal">
                                <span class="card-title"><i class="material-icons">close</i></span>
                                <h5>Lorem, ipsum dolor.</h5>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, nisi facilis? Accusamus velit quas omnis? Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam minus cupiditate nemo quas nihil eius?</p>

                                <div class="chip">
                                    <img src="${pictureProfile}" alt="">
                                    <span>Posted by ${username}</span>
                                </div>

                                <a href="#" class="btn purple lighten-1 waves-effect" style="display: block; margin-top: 10px;"><i class="material-icons left">thumb_up</i>I liked it</a>
                            </div>

                        </div>
                    </div>`

                    mobileItems.innerHTML += 
                    `<div class="col m12">
                        <div class="card">
                            <div class="card-image">
                                <img src="${img}">
                                <span class="card-title">${title}</span>
                                <a class="btn-floating halfway-fab purple waves-effect activator right tooltipped" data-position="right" data-tooltip="More details"><i class="material-icons">info</i></a>
                            </div>
                            <div class="card-content">
                                <p>${description}</p>
                                <div class="chip" style="margin-top: 10px;">
                                    <img src="${pictureProfile}" alt="">
                                    <span>Posted by ${username}</span>
                                </div>
                            </div>

                            <div class="card-reveal">
                                <span class="card-title"><i class="material-icons">close</i></span>
                                <h5>Lorem, ipsum dolor.</h5>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, nisi facilis? Accusamus velit quas omnis? Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam minus cupiditate nemo quas nihil eius?</p>

                                <div class="chip">
                                    <img src="${pictureProfile}" alt="">
                                    <span>Posted by ${username}</span>
                                </div>

                                <a href="#" class="btn purple lighten-1 waves-effect" style="display: block; margin-top: 10px;"><i class="material-icons left">thumb_up</i>I liked it</a>
                            </div>

                        </div>
                    </div`
            }
        }else {
            console.log('Retornado')
            return
        }
    })
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

const idGenerator = (length, characters) => {
    let result = ""
    const charactersLength = characters.length
    for(let i = 0; i < length; i++) {
        result += characters.charAt(Math.random() * charactersLength)
    }
    return result
}

const requestForPostCreation = async (postTitle, postDescription, postImage, newId) => {

    const documentSnapshot = await getDoc(doc(db, "users_posts", auth.currentUser.uid))

    const createNewPostButton = document.querySelector('[data-js="create-post"]')

    const postImageInput = document.querySelector('.file-path')

    if(documentSnapshot.exists()) {
        const domProgressDetermined = document.querySelector('.determinate')
        const storageReference = ref(storage, `images_posts/${postImage.name}`)

        const resultTask = uploadBytesResumable(storageReference, postImage)
        const newElement = document.createElement('span')
        createNewPostButton.parentElement.classList.add('disabled')
        
        resultTask.on('state_changed', (imageSnapshot) => {
            const percentage = Math.floor((imageSnapshot.bytesTransferred / imageSnapshot.totalBytes) * 100)
            newElement.textContent = `${percentage}%`
            domProgressDetermined.parentElement.insertAdjacentElement('afterend', newElement)
            domProgressDetermined.style.width = `${percentage}%`
        }, (error) => {
            console.log(error, error.message, error.code)
        }, async () => {
            console.log(resultTask._metadata.fullPath)
            const image = await getDownloadURL(ref(storage, resultTask._metadata.fullPath))
            updateDoc(doc(db, "users_posts", auth.currentUser.uid), {
                [`posts.${newId}`]: [image, `${postTitle.value}`, `${postDescription.value}`]
            })

            const postsDataDetails = [postTitle, postDescription, postImageInput]
            postsDataDetails.map(postsDetails => postsDetails.value = "")
            // postTitle.value = ""
            // postDescription.value = ""
            // postImage.value = ""
            domProgressDetermined.style.width = "0"
            newElement.textContent = "Posted!"
            
            document.documentElement.scrollTo({ top: document.documentElement.scrollHeight - document.documentElement.scrollTop, behavior: 'smooth' })
            document.querySelector('[data-js="create-post"]').parentElement.classList.remove('disabled')

            // let i = 5
            // let interval = null
            // interval = setInterval(() => {
            //     console.log(interval)
            //     i--
            //     newElement.textContent = "Posted! Closed in: " + i
                
            //     if(i === 1 && interval != null) {
            //         newElement.remove()
            //         M.Modal.getInstance(document.querySelector('#create-new-post')).close()
            //         clearInterval(interval)
            //     }

            // }, 1000)

        })


    }else {
        setDoc(doc(db, "users_posts", auth.currentUser.uid), {
            userUid: auth.currentUser.uid,
            posts: {},
            username: auth.currentUser.displayName,
            pictureProfile: auth.currentUser.photoURL || userProfilePicture.src
        }).then(() => console.log('Sucesso'))
    }
}

createNewPostContainer.addEventListener('click', event => {

    const postTitle = createNewPostContainer.querySelector('[name="post_title"]')
    const postDescription = createNewPostContainer.querySelector('[name="post_description"]')
    const postImage = imageSendInput.files[0]

    if(event.target.id === "generate-lorem-button"){
        postTitle.value = "Lorem ipsum dolor sit amet."
        postDescription.value = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora, libero!"
    }

    const postsDetails = [postTitle.value, postDescription.value]
    if(postsDetails.includes('') || postImage === undefined) {
        return console.log('Please, insert a value before continue.')
    }

    const generateNewId = idGenerator(6, 'ABCDEF0123456')

    if(event.target.dataset.js === "create-post") {
        requestForPostCreation(postTitle, postDescription, postImage, generateNewId)
    }
})

newAccountPictureSection.addEventListener('click', () => {
    inputNewFile.click()
})

const sendNewProfilePictureToDatabase = async (photo) => {
    const pictureProfileReference = ref(storage, `users_profile_picture/${photo.name}`)

    const resultTask = await uploadBytes(pictureProfileReference, photo)
    const { fullPath } = resultTask.metadata

    const fileToDownload = await getDownloadURL(pictureProfileReference, fullPath)

    await updateProfile(auth.currentUser, { photoURL: fileToDownload })
    await updateDoc(doc(db, "users_posts", userUid), {
        pictureProfile: fileToDownload })

}

inputNewFile.addEventListener('change', async (event) => {    
    const photo = event.target.files[0]
    const photoType = photo.type.replace('image/', '')

    const validFiles = ['jpg', 'jpeg', 'png', 'gif']

    if(!validFiles.includes(photoType)) {
        const informationMessage = console.log(`Please, input a value that is: ${validFiles.join(', ')}`)
        setTimeout(() => { inputNewFile.click() }, 1)
        return informationMessage
    }

    const url = URL.createObjectURL(photo)
    await sendNewProfilePictureToDatabase(photo)

    userProfilePicture.src = url

})

// const x = await getDocs(collection(db, "users_posts"))
// const index = Math.floor(Math.random() * (x.docs.length - 1 + 1))
