import { db, auth, storage } from './auth.js'
import { addClass, removeClass, setupNavbar } from './utils.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js"
import { setDoc, doc, getDoc, getDocs, updateDoc, collection, query, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js'
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-storage.js'

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

let currentUser = null

const setupUserExperience = async (user) => {
    userProfilePicture.src = auth.currentUser.photoURL || userProfilePicture.src
    currentUser = await user
    updateDetails()
}

const cssProperties = {
    color: 'red',
    backgroundColor: 'blue',
    marginTop: '10px'
}

const upperCaseLetters = 
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 
    'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

const properties = (obj) => {

    const cssPropertiesToArray = Object.entries(obj)

    const notUpperCase = cssPropertiesToArray.filter(([property]) => {
        if(!property.match(/[A-Z]/g)) {
            return property
        }
    }).reduce((acc, item) => {
        acc += item[0] + ": " + item[1] + "; "
        return acc
    }, '')

    const result = cssPropertiesToArray.reduce((acc, property) => {

        for(let i = 0; i < property[0].length; i++) {
            if(upperCaseLetters.includes(property[0][i])) {
                acc += property[0].replace(property[0].charAt(i), '-'+property[0].charAt(i).toLowerCase()) + ": " + property[1] + "; "
            }
        }

        return acc
    }, notUpperCase)

    return result

}



const createElement = (elementName, textContent, style, ...classes) => {
    const newElement = document.createElement(elementName)
    newElement.textContent = textContent
    newElement.classList.add(...classes)
    newElement.style.marginTop =' 50px';
    newElement.setAttribute('style', style)
    document.querySelector('.slides').insertAdjacentElement('afterend', newElement)
    
}

onAuthStateChanged(auth, (user) => {
    if(user) {
        setupUserExperience(user)
        setupNavbar(user, navbar)
        if(document.querySelector('.user-login-information')) {
            document.querySelector('.user-login-information').remove()
        }

    }else {
        setupNavbar(user, navbar)
        desktopItems.innerHTML = ''
        mobileItems.innerHTML = ''

        createElement(
            'h5', 
            'Please, login in your account to see the posts.', 
            properties({ marginTop: '50px' }), 
            'user-login-information', 
            'center-align', 
            'white-text')
        
    }
})

const updateDetails = () => {

    const { uid } = currentUser

    onSnapshot(doc(db, 'users_posts', uid), async documentReference => {

        desktopItems.innerHTML = ''

        if(documentReference.data() === undefined) {
            return
        }

        const { pictureProfile, username } = documentReference.data()
        const postsData = await documentReference.data().posts

        if(postsData === undefined) {
            return
        }

        const postsInArrayFromDatabase = Object.values(postsData)
        const postsInHTMLFormat = rowForEachDeviceSize => 
            postsInArrayFromDatabase.reduce((acc, value) => {
                const [img, title, description] = value

                acc += `<div class="col ${rowForEachDeviceSize}">
                            <div class="card z-depth-3">
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
                return acc
        }, '')
        
        desktopItems.innerHTML = postsInHTMLFormat('s6')
        mobileItems.innerHTML = postsInHTMLFormat('m12')

    })
}

const newElement = document.createElement('p')

navbar.forEach(navbar => {
    navbar.addEventListener('click', (event) => {
        if(event.target.dataset.target === "login-modal") {
            M.Modal.getInstance(document.querySelector('#login-modal')).open()
            if(localStorage.getItem('userdetails')) {
                M.Modal.getInstance(document.querySelector('#login-modal')).close()
                M.Modal.getInstance(document.querySelector('#details-recovered')).open()

                const userDetailsFromStorage = JSON.parse(localStorage.getItem('userdetails'))
                console.log(userDetailsFromStorage)

                const selectorDetailsRecoveredForAppendElement = document.querySelector('.details-localstorage')

                
                newElement.textContent = userDetailsFromStorage.email

                selectorDetailsRecoveredForAppendElement.insertAdjacentElement('afterend', newElement)
            }
        }

        if(event.target.dataset.js === "loggout-button") {
            signOut(auth)
        }
    })
})

document.querySelector('#details-recovered').addEventListener('click', event => {
    const userDetailsFromStorage = JSON.parse(localStorage.getItem('userdetails'))

    if(event.target.id === "confirmation-for-login-localstorage") {

        signInWithEmailAndPassword(auth, userDetailsFromStorage.email, userDetailsFromStorage.password).then(() => { 
            M.Modal.getInstance(document.querySelector('#details-recovered')).close()
        })
    }

    if(event.target.id === "negation-for-login-localstorage") {
        M.Modal.getInstance(document.querySelector('#details-recovered')).close()
        M.Modal.getInstance(document.querySelector('#login-modal')).open()
        localStorage.removeItem('userdetails')

    }
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

function User(email, password) {
    this.email = email 
    this.password = password
}

loginAccountForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const email = event.target.email.value
    const password = event.target.password.value

    if(event.target.remember.checked) {
        const userLocal = new User(email, password)
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
        addClass(createNewPostButton, 'disabled', true)

        resultTask.on('state_changed', (imageSnapshot) => {

            const percentage = Math.floor((imageSnapshot.bytesTransferred / imageSnapshot.totalBytes) * 100)

            newElement.textContent = `${percentage}%`
            domProgressDetermined.parentElement.insertAdjacentElement('afterend', newElement)
            domProgressDetermined.style.width = `${percentage}%`

        }, (catchError) => {
            return console.log(catchError)
        }, async () => {

            const { fullPath } = resultTask._metadata
            const image = await getDownloadURL(ref(storage, fullPath))
            await updateDoc(doc(db, "users_posts", auth.currentUser.uid), {
                [`posts.${newId}`]: [image, `${postTitle.value}`, `${postDescription.value}`]
            })

            const postsDataDetails = [postTitle, postDescription, postImageInput]
            postsDataDetails.forEach(postsDetails => postsDetails.value = "")

            domProgressDetermined.style.width = "0"
            newElement.textContent = "Posted! This section will close in five seconds."
            
            const clientHeight = document.documentElement.scrollHeight - document.documentElement.scrollTop

            document.documentElement.scrollTo({ top: clientHeight, behavior: 'smooth' })
            removeClass(createNewPostButton, 'disabled', true)

            setTimeout(() => {
                newElement.remove()
                M.Modal.getInstance(createNewPostContainer).close()
            }, 5 * 1000)

        })


    }else {
        await setDoc(doc(db, "users_posts", auth.currentUser.uid), {
            userUid: auth.currentUser.uid,
            posts: {},
            username: auth.currentUser.displayName,
            pictureProfile: auth.currentUser.photoURL || userProfilePicture.src
        })
    }
}

createNewPostContainer.addEventListener('click', event => {
    
    if(event.target.id === "generate-lorem-button"){
        postTitle.value = "Lorem ipsum dolor sit amet."
        postDescription.value = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora, libero!"
    }

    const postTitle = createNewPostContainer.querySelector('[name="post_title"]')
    const postDescription = createNewPostContainer.querySelector('[name="post_description"]')
    const postImage = imageSendInput.files[0]

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