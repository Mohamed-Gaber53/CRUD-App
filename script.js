// DOM Elements
let createBtn = document.getElementById("create");
let searchBtn = document.getElementById("search-btn");
let searchInput = document.getElementById("search");
let deleteAll = document.getElementById("delete-all");
let confirmDeletionAll = document.getElementById("clear-yes");
let cancelDeletion = document.getElementById("clear-no");
let clearMessageContainer = document.querySelector(".clear-message__container");
let productFormCancelBtn = document.getElementById("product-cancel");
let createProductForm = document.getElementById("create-product");
let productForm = document.getElementById("product-form");
let productTitle = document.getElementById("product-title");
let productPrice = document.getElementById("product-price");
let productTaxes = document.getElementById("product-taxes");
let productDiscount = document.getElementById("product-discount");
let calculateTotal = document.getElementById("calculate-total");
let productCount = document.getElementById("product-count");
let productCategory = document.getElementById("product-category");
let productAds = document.getElementById("product-ads");
let productSubmit = document.getElementById("product-submit");

let editMode = false;
let editIndex = null;

// Helper Functions
let toggleVisibility = (ele, show) => ele.classList.toggle("hidden", !show);
let show = (ele) => ele.classList.remove("hidden");
let hide = (ele) => ele.classList.add("hidden");

// Product Management
let productIndex = 1;
let productsArray = JSON.parse(localStorage.getItem("products")) || [];

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

function loadProducts() {
  let tbody = document.getElementById("product-tbody");
  tbody.innerHTML = "";

  productsArray.forEach((product) => {
    renderProductRow(product);
  });

  if (productsArray.length > 0) {
    productIndex = Math.max(...productsArray.map((p) => p.productIndex)) + 1;
  }
}

// Event Handlers
document.addEventListener("click", (e) => {
  let clearMessage = document.getElementById("clear-message");
  if (clearMessage && !clearMessage.contains(e.target)) {
    hide(clearMessageContainer);
  }
});

deleteAll.addEventListener("click", (e) => {
  e.stopPropagation();
  show(clearMessageContainer);
});

cancelDeletion.addEventListener("click", (e) => {
  e.stopPropagation();
  hide(clearMessageContainer);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hide(clearMessageContainer);
    if (editMode) {
      cancelEdit();
    } else {
      hide(createProductForm);
    }
  }
});

productFormCancelBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  cancelEdit();
});

createBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  reset();
  show(createProductForm);
  productTitle.focus();
});

document.addEventListener("click", (e) => {
  if (
    !productForm.contains(e.target) &&
    !e.target.classList.contains("product-update__btn")
  ) {
    hide(createProductForm);
    if (editMode) {
      cancelEdit();
    }
  }
});

productForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editMode) {
    updateProduct(editIndex);
  } else {
    addProduct();
  }
});

searchBtn.addEventListener("click", () => {
  searchInput.classList.toggle("hidden");
  if (!searchInput.classList.contains("hidden")) {
    searchInput.focus();
  } else {
    searchInput.value = "";
    search("");
  }
});

// Product Functions
function reset() {
  productTitle.value = "";
  productPrice.value = "";
  productTaxes.value = "";
  productAds.value = "";
  productDiscount.value = "";
  productCount.value = "";
  productCategory.value = "";
  editMode = false;
  editIndex = null;
}

function cancelEdit() {
  reset();
  hide(createProductForm);
}

function getProductInputValues() {
  return {
    title: productTitle.value.trim(),
    price: parseFloat(productPrice.value) || 0,
    taxes: parseFloat(productTaxes.value) || 0,
    ads: parseFloat(productAds.value) || 0,
    discount: parseFloat(productDiscount.value) || 0,
    count: parseInt(productCount.value) || 1,
    category: productCategory.value.trim(),
  };
}

function validateProduct(product) {
  if (product.title === "") {
    alert("Please enter a product title");
    return false;
  }
  if (product.price <= 0) {
    alert("Price must be greater than 0");
    return false;
  }
  if (product.taxes < 0) {
    alert("Taxes cannot be negative");
    return false;
  }
  if (product.ads < 0) {
    alert("Ads cost cannot be negative");
    return false;
  }
  if (product.discount < 0) {
    alert("Discount cannot be negative");
    return false;
  }
  if (product.count < 1) {
    alert("Count must be at least 1");
    return false;
  }
  if (product.category === "") {
    alert("Please select a category");
    return false;
  }
  return true;
}

function addProduct() {
  let newProduct = getProductInputValues();

  if (!validateProduct(newProduct)) return;

  let total =
    newProduct.price + newProduct.taxes + newProduct.ads - newProduct.discount;
  let product = {
    productIndex: productIndex,
    title: newProduct.title,
    price: newProduct.price,
    taxes: newProduct.taxes,
    ads: newProduct.ads,
    discount: newProduct.discount,
    total: total,
    count: newProduct.count,
    category: newProduct.category,
  };

  productsArray.push(product);
  localStorage.setItem("products", JSON.stringify(productsArray));

  renderProductRow(product);
  productIndex++;
  reset();
  hide(createProductForm);
}

function renderProductRow(product) {
  let tbody = document.getElementById("product-tbody");
  let tr = document.createElement("tr");
  tr.id = `product-${product.productIndex}`;

  tr.innerHTML = `
    <td class="product-num">${product.productIndex}</td>
    <td class="product-count ${product.count <= 5 ? "below" : ""}" 
        id="count-${product.productIndex}">${product.count}</td>
    <td class="product-title">${product.title}</td>
    <td class="product-category">${product.category}</td>
    <td class="product-price">${product.price.toFixed(2)}</td>
    <td class="product-taxes">${product.taxes.toFixed(2)}</td>
    <td class="product-ads">${product.ads.toFixed(2)}</td>
    <td class="product-discount">${product.discount.toFixed(2)}</td>
    <td class="product-total">${product.total.toFixed(2)}</td>
    <td>
      <button onclick="updateProductHandler(event, ${product.productIndex})" 
              class="product-btn product-update__btn" 
              id="update-${product.productIndex}">
        Update
      </button>
    </td>
    <td>
      <button onclick="deleteProductHandler(event, ${product.productIndex})" 
              class="product-btn product-delete__btn" 
              id="delete-${product.productIndex}">
        Delete
      </button>
    </td>
  `;
  tbody.appendChild(tr);
}

function deleteProductHandler(event, index) {
  event.stopPropagation();
  dele(index);
}

function updateProductHandler(event, index) {
  event.stopPropagation();
  update(event, index);
}

function dele(index) {
  let productIndex = productsArray.findIndex((p) => p.productIndex === index);

  if (productIndex === -1) return;

  if (productsArray[productIndex].count > 1) {
    productsArray[productIndex].count -= 1;
    document.getElementById(`count-${index}`).textContent =
      productsArray[productIndex].count;
  } else {
    document.getElementById(`product-${index}`).remove();
    productsArray.splice(productIndex, 1);
  }

  localStorage.setItem("products", JSON.stringify(productsArray));
}

function clearAllTasks() {
  if (productsArray.length === 0) {
    alert("No data to clear.");
    hide(clearMessageContainer);
    return;
  }

  localStorage.removeItem("products");
  productsArray = [];
  productIndex = 1;
  document.getElementById("product-tbody").innerHTML = "";
  hide(clearMessageContainer);
}

// Search Functions
searchInput.addEventListener("input", () => {
  let word = searchInput.value.trim().toLowerCase();
  search(word);
});

function search(word) {
  let tbody = document.getElementById("product-tbody");
  tbody.innerHTML = "";

  if (!word) {
    productsArray.forEach(renderProductRow);
    return;
  }

  let filtered = productsArray.filter((product) => {
    return (
      product.title.toLowerCase().includes(word) ||
      product.category.toLowerCase().includes(word)
    );
  });

  filtered.forEach(renderProductRow);
}

// Update Functions
function update(event, index) {
  event.stopPropagation();

  let product = productsArray.find((product) => product.productIndex === index);

  if (!product) {
    alert("Product not found!");
    return;
  }

  productTitle.value = product.title;
  productPrice.value = product.price;
  productTaxes.value = product.taxes;
  productAds.value = product.ads;
  productDiscount.value = product.discount;
  productCount.value = product.count;
  productCategory.value = product.category;

  show(createProductForm);
  productTitle.focus();

  editMode = true;
  editIndex = index;
}

function updateProduct(index) {
  let updatedProduct = getProductInputValues();

  if (!validateProduct(updatedProduct)) return;

  let total =
    updatedProduct.price +
    updatedProduct.taxes +
    updatedProduct.ads -
    updatedProduct.discount;

  let productIndex = productsArray.findIndex((p) => p.productIndex === index);

  if (productIndex === -1) {
    alert("Product not found.");
    return;
  }

  productsArray[productIndex] = {
    productIndex: index,
    title: updatedProduct.title,
    price: updatedProduct.price,
    taxes: updatedProduct.taxes,
    ads: updatedProduct.ads,
    discount: updatedProduct.discount,
    total: total,
    count: updatedProduct.count,
    category: updatedProduct.category,
  };

  localStorage.setItem("products", JSON.stringify(productsArray));
  loadProducts();
  cancelEdit();
}

// Event Listeners
productSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  if (editMode) {
    updateProduct(editIndex);
  } else {
    addProduct();
  }
});

confirmDeletionAll.addEventListener("click", (e) => {
  e.stopPropagation();
  clearAllTasks();
});
