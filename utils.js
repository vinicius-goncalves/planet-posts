const domParentElement = (element) => element.parentElement?.classList
const domElement = (element) => element.classList

export const addClass = (element, classToAdd, parentElement = false) => {
    return parentElement 
        ? domParentElement(element).add(classToAdd) 
        : domElement(element).add(classToAdd)
}

export const removeClass = (element, classToRemove, parentElement = false) => {
    return parentElement 
        ? domParentElement(element).remove(classToRemove) 
        : domElement(element).remove(classToRemove)
}

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