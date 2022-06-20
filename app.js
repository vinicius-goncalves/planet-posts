import { db, auth } from './auth.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js"

const registerAccountForm = document.querySelector('#register-modal')
const loginAccountForm = document.querySelector('#login-modal')

const navbar = document.querySelectorAll('[data-js="nav-bar"]')

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

onAuthStateChanged(auth, (user) => {
    if(user) {
        setupNavbar(user)
    }else {
        setupNavbar(user)
    }
})
