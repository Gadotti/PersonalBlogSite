window.addEventListener("scroll", function (event) {
    const scroll = this.scrollY;

    const element = document.getElementById("rocket");
    if (scroll > 50) {
        element.classList.add("show");
    } else {
        element.classList.remove("show");
    }
});

document.getElementById("rocket").click = () => {
    const element = document.getElementById("rocket");
    element.classList.add("launch");

    document.body.animate = () => {
        window.scroll(0, 0);
    }, 1000, function() {
        element.classList.remove("show launch");
    };
    return false;
};