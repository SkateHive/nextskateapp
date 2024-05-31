const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           
        .replace(/[^\w\-]+/g, '')      
        .replace(/\-\-+/g, '-')        
        .replace(/^-+/, '')            
        .replace(/-+$/, '');           
}

export default slugify;