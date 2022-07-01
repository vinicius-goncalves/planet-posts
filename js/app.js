import { db, auth, storage } from './auth.js'
import { addClass, removeClass } from './utils.js'
import { setupNavbar, updateUserDetails } from './user-experience.js'

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js'
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

const usernameModal = document.querySelector('.username-account-modal')
const emailModal = document.querySelector('.email-account-modal')

let currentUser = null

console.log(DOMPurify.sanitize('<img src="somewhere" onerror="alert("catch")/>'))

const setupUserExperience = async (user) => {
    const { displayName, email } = user
    userProfilePicture.src = auth.currentUser.photoURL || userProfilePicture.src
    currentUser = await user
    updateDetails()
    const x = updateUserDetails(user, () => {
        usernameModal.textContent = displayName
        emailModal.textContent = email
    }, () => {
        return 'An error ocurr'
    })
}

const jsPropertiesTransform = (obj) => {

    const upperCaseLetters = 
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 
        'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 
        'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

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

const createElement = (elementName, textContent, style, classes) => {

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
            jsPropertiesTransform({ marginTop: '50px' }), 
            ['user-login-information', 'center-align', 'white-text'])
        
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

        const postsToArray = Object.values(postsData)
        const posts = (deviceWidth) => postsToArray.map(post => {
            const [ img, title, description ] = post
            
            const divElement = document.createElement('div')
            divElement.classList.add('col', deviceWidth)

            const cardElement = document.createElement('div')
            cardElement.classList.add('card', 'z-depth-3')
            divElement.append(cardElement)

            const cardImage = document.createElement('div')
            cardImage.classList.add('card-image')
            cardElement.append(cardImage)

            const image = document.createElement('img')
            image.src = img
            cardImage.append(image)

            const span = document.createElement('span')
            span.classList.add('card-title')
            span.textContent = title
            cardImage.append(span)
            
            const aElement = document.createElement('a')
            aElement.classList.add('btn-floating', 'halfway-fab', 'purple', 'waves-effect', 'activator', 'rigth', 'tooltipped')
            aElement.dataset.position = 'right'
            aElement.dataset.tooltip = 'More details'
            cardImage.append(aElement)

            const iElement = document.createElement('i')
            iElement.classList.add('material-icons')
            iElement.textContent = 'info'
            aElement.append(iElement)

            const cardContent = document.createElement('div')
            cardContent.classList.add('card-content')
            cardElement.append(cardContent)
            
            const p = document.createElement('p')
            p.textContent = description
            cardContent.append(p)

            const chip = document.createElement('div')
            chip.classList.add('chip')
            chip.style.marginTop = '10px'
            cardContent.append(chip)
            
            const chipImage = document.createElement('img')
            chipImage.src = pictureProfile
            chip.append(chipImage)

            const postedBy = document.createElement('span')
            postedBy.textContent = `Posted by: ${username}`
            chip.append(postedBy)

            const cardReveal = document.createElement('div')
            cardReveal.classList.add('card-reveal')
            cardElement.append(cardReveal)

            const cardTitleCardReveal = document.createElement('span')
            cardTitleCardReveal.classList.add('card-title')
            cardReveal.append(cardTitleCardReveal)
            
            const iElementCardReveal = document.createElement('i')
            iElementCardReveal.classList.add('material-icons')
            iElementCardReveal.textContent = 'close'
            cardTitleCardReveal.append(iElementCardReveal)

            const h5CardReveal = document.createElement('h5')
            h5CardReveal.textContent = 'Lorem, ipsum dolor.'
            cardReveal.append(h5CardReveal)

            const pCardReveal = document.createElement('p')
            pCardReveal.textContent = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, nisi facilis? Accusamus velit quas omnis? Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquam minus cupiditate nemo quas nihil eius?'
            cardReveal.append(pCardReveal)

            const chipCardReveal = document.createElement('div')
            chipCardReveal.classList.add('chip')
            cardReveal.append(chipCardReveal)

            const imgChipCardReveal = document.createElement('img')
            imgChipCardReveal.src = pictureProfile
            chipCardReveal.append(imgChipCardReveal)

            const spanChipCardReveal = document.createElement('span')
            spanChipCardReveal.textContent = `Posted by ${username}`
            chipCardReveal.append(spanChipCardReveal)
            
            const aChipCardReveal = document.createElement('a')
            aChipCardReveal.href = '#'
            aChipCardReveal.classList.add('btn', 'purple', 'lighten-1', 'waves-effect', 'center-align')
            aChipCardReveal.style.display = 'block'
            aChipCardReveal.style.marginTop = '10px'
            aChipCardReveal.textContent = 'I liked it'
            chipCardReveal.append(aChipCardReveal)
            
            const iElementToaElementChipCardReveal = document.createElement('i')
            iElementToaElementChipCardReveal.classList.add('material-icons', 'right')
            iElementToaElementChipCardReveal.textContent = 'thumb_up'
            aChipCardReveal.append(iElementToaElementChipCardReveal)

            return divElement

        })

        posts('s6').map(post => desktopItems.append(post))
        posts('m12').map(post => mobileItems.append(post))

    })
}

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
                [`posts.${newId}`]: 
                    [image, `${DOMPurify.sanitize(postTitle.value)}`,
                     `${DOMPurify.sanitize(postDescription.value)}`]
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
    await updateDoc(doc(db, "users_posts", currentUser.uid), {
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