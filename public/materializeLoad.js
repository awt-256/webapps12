// lol
document.addEventListener('DOMContentLoaded', function () {
    const elems = document.querySelectorAll('.modal');
    const instances = M.Modal.init(elems, {});
});

document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.dropdown-trigger');
    for (const elem of elems) {
        if (elem.attributes.getNamedItem('data-target').value === "categorize-dropdown") {
            const categoryInput = document.querySelector('input[x-dropdown="categorize-dropdown"]');
            const instance = M.Dropdown.init(elem, {});
            instance.dropdownEl.onclick = (evnt) => {
                const focus = evnt.srcElement.getAttribute('value') - 0;
                if (-2 === focus) {
                    const creationFormBtn = document.querySelector('#category-creation-submission');
                    creationFormBtn.onclick = () => {
                        const li = document.createElement("li");
                        const categoryName = document.querySelector('#category-name').value;
                        const id = instance.dropdownEl.children.length - 2;
                        li.setAttribute("value", id)
                        li.innerHTML = `<a href="#!" value="${id}">${categoryName}</a>`;// xss is present throughout codebase
                        instance.dropdownEl.querySelector(".divider").before(li);
                        categoryInput.value = categoryName;
                        document.querySelector('a[data-target="categorize-dropdown"]').innerText = "Category: " + categoryInput.value;
                        creationFormBtn.onclick = null;
                        M.Modal.getInstance(document.querySelector("#new-category")).close();
                    }
                } else if (focus !== -1) {
                    categoryInput.value = instance.dropdownEl.children[focus].innerText;
                }
                if (categoryInput.value) {
                    document.querySelector('a[data-target="categorize-dropdown"]').innerText = "Category: " + categoryInput.value;
                }
            };
        } else M.Dropdown.init(elem, {});
    }
  });