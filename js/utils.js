const domParentElement = element => element.parentElement.classList
const domElement = element => element.classList

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