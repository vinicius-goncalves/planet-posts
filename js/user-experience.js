const navbar = document.querySelectorAll('[data-js="nav-bar"]')

export const setupNavbar = (user, ...navbarFromDOM) => {
    const navbars = [...navbarFromDOM]
    const [ navbarLiExtraction ] = navbars
    
    navbarLiExtraction.forEach(navbar => {
        navbar.style.display = 'block'
        const navbarChildren = [...navbar.children]
        navbarChildren.forEach(li => {
            const userLoggedInItems = li.dataset.js.includes(user ? 'logged-in' : 'logged-out')
            userLoggedInItems ? li.style.display = 'block' : li.style.display = 'none'
        })
    })
}

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