const storageKey = "STORAGE_KEY";

const formAddingBook = document.getElementById("inputBook");
const formSearchingBook = document.getElementById("searchBook");

function CheckForStorage() {
  return typeof Storage !== "undefined";
}

formAddingBook.addEventListener("submit", function (event) {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = parseInt(document.getElementById("inputBookYear").value);
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const idTemp = document.getElementById("inputBookTitle").name;
  
  if (idTemp !== "") {
    const bookData = GetBookList();
    for (let index = 0; index < bookData.length; index++) {
      if (bookData[index].id == idTemp) {
        bookData[index].title = title;
        bookData[index].author = author;
        bookData[index].year = year;
        bookData[index].isComplete = isComplete;
      }
    }
    localStorage.setItem(storageKey, JSON.stringify(bookData));
    ResetAllForm();
    RenderBookList(bookData);
    return;
  }

  const id = JSON.parse(localStorage.getItem(storageKey)) === null ? 0 + Date.now() : JSON.parse(localStorage.getItem(storageKey)).length + Date.now();
  const newBook = {
    id: id,
    title: title,
    author: author,
    year: year,
    isComplete: isComplete,
  };

  PutBookList(newBook);

  const bookData = GetBookList();
  RenderBookList(bookData);
});

function PutBookList(data) {
  if (CheckForStorage()) {
    let bookData = [];

    if (localStorage.getItem(storageKey) !== null) {
      bookData = JSON.parse(localStorage.getItem(storageKey));
    }

    bookData.push(data);
    localStorage.setItem(storageKey, JSON.stringify(bookData));
  }
}


function RenderBookList(bookData) {
  if (bookData === null) {
      return;
  }

  const containerIncomplete = document.getElementById("incompleteBookshelfList");
  const containerComplete = document.getElementById("completeBookshelfList");

  containerIncomplete.innerHTML = "";
  containerComplete.innerHTML = "";
  
  for (let book of bookData) {
      const id = book.id;
      const title = book.title;
      const author = book.author;
      const year = book.year;
      const isComplete = book.isComplete;

      // Create book item
      let bookItem = document.createElement("div");
      bookItem.classList.add("book_item", "select_item");

      bookItem.setAttribute("data-bookid", id); // id buku
      bookItem.setAttribute("data-testid", "bookItem"); 

      bookItem.innerHTML = "<h3 data-testid='bookItemTitle' name = " + id + ">" + title + "</h3>";
      bookItem.innerHTML += "<p data-testid='bookItemAuthor'>Penulis: " + author + "</p>";
      bookItem.innerHTML += "<p data-testid='bookItemYear'>Tahun: " + year + "</p>";

      // Container action item
      let containerActionItem = document.createElement("div");
      containerActionItem.classList.add("action");
      
      // Create green button (for mark as complete)
      const greenButton = CreateGreenButton(book, function (event) {
          isCompleteBookHandler(event.target.parentElement.parentElement);
          const bookData = GetBookList();
          RenderBookList(bookData);
      });

      // Create red button (for delete)
      const redButton = CreateRedButton(function (event) {
          DeleteAnItem(event.target.parentElement.parentElement);
          const bookData = GetBookList();
          RenderBookList(bookData);
      });

      // Create edit button
      const editButton = CreateEditButton(function (event) {
        UpdateAnItem(event.target.parentElement.parentElement);
    });

      containerActionItem.append(greenButton, redButton, editButton);
      bookItem.append(containerActionItem);

      // Incomplete book
      if (isComplete === false) {
          containerIncomplete.append(bookItem);
          continue;
      }

      // Complete book
      containerComplete.append(bookItem);
  }
}


function CreateGreenButton(book, eventListener) {
  const isSelesai = book.isComplete ? "Belum selesai" : "Selesai";

  const greenButton = document.createElement("button");
  greenButton.classList.add("green");
  greenButton.innerText = isSelesai + " di Baca";

  greenButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  
  greenButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return greenButton;
}

function CreateRedButton(eventListener) {
  const redButton = document.createElement("button");
  redButton.classList.add("red");
  redButton.innerText = "Hapus buku";

  redButton.setAttribute("data-testid", "bookItemDeleteButton");

  redButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return redButton;
}

function CreateEditButton(eventListener) {
  const editButton = document.createElement("button");
  editButton.classList.add("edit");
  editButton.innerText = "Edit buku";

  editButton.setAttribute("data-testid", "bookItemEditButton");

  editButton.addEventListener("click", function (event) {
    eventListener(event);
  });
  return editButton;
}

function isCompleteBookHandler(itemElement) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const title = itemElement.childNodes[0].innerText;
  const titleNameAttribut = itemElement.childNodes[0].getAttribute("name");
  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].title === title && bookData[index].id == titleNameAttribut) {
      bookData[index].isComplete = !bookData[index].isComplete;
      break;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}

function SearchBookList(title) {
  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const bookList = [];

  for (let index = 0; index < bookData.length; index++) {
    const tempTitle = bookData[index].title.toLowerCase();
    const tempTitleTarget = title.toLowerCase();
    if (bookData[index].title.includes(title) || tempTitle.includes(tempTitleTarget)) {
      bookList.push(bookData[index]);
    }
  }
  return bookList;
}

function GreenButtonHandler(parentElement) {
  let book = isCompleteBookHandler(parentElement);
  book.isComplete = !book.isComplete;
}

function GetBookList() {
  if (CheckForStorage) {
    return JSON.parse(localStorage.getItem(storageKey));
  }
  return [];
}


let itemToDelete = null; // Untuk menyimpan elemen yang akan dihapus

function DeleteAnItem(itemElement) {
  // Simpan elemen buku yang akan dihapus
  itemToDelete = itemElement;

  // Tampilkan modal
  const deleteModal = document.getElementById("deleteModal");
  deleteModal.style.display = "block";
}

// Jika pengguna klik "Iya" untuk menghapus buku
document.getElementById("confirmDelete").addEventListener("click", function () {
  if (itemToDelete !== null) {
    const bookData = GetBookList();
    const titleNameAttribut = itemToDelete.childNodes[0].getAttribute("name");
    
    for (let index = 0; index < bookData.length; index++) {
      if (bookData[index].id == titleNameAttribut) {
        bookData.splice(index, 1);  // Hapus buku dari daftar
        break;
      }
    }

    localStorage.setItem(storageKey, JSON.stringify(bookData)); // Update localStorage
    
    // Tutup modal
    document.getElementById("deleteModal").style.display = "none";

    // Render ulang daftar buku
    RenderBookList(bookData);
  }
});

// Jika pengguna klik "Tidak" untuk membatalkan penghapusan
document.getElementById("cancelDelete").addEventListener("click", function () {
  // Tutup modal tanpa menghapus buku
  document.getElementById("deleteModal").style.display = "none";
});



function UpdateAnItem(itemElement) {
  if (itemElement.id === "incompleteBookshelfList" || itemElement.id === "completeBookshelfList") {
    return;
  }

  const bookData = GetBookList();
  if (bookData.length === 0) {
    return;
  }

  const title = itemElement.childNodes[0].innerText;
  const author = itemElement.childNodes[1].innerText.slice(9, itemElement.childNodes[1].innerText.length);
  const getYear = itemElement.childNodes[2].innerText.slice(7, itemElement.childNodes[2].innerText.length);
  const year = parseInt(getYear);

  const isComplete = itemElement.childNodes[3].childNodes[0].innerText.length === "Selesai di baca".length ? false : true;

  const id = itemElement.childNodes[0].getAttribute("name");
  document.getElementById("inputBookTitle").value = title;
  document.getElementById("inputBookTitle").name = id;
  document.getElementById("inputBookAuthor").value = author;
  document.getElementById("inputBookYear").value = year;
  document.getElementById("inputBookIsComplete").checked = isComplete;

  for (let index = 0; index < bookData.length; index++) {
    if (bookData[index].id == id) {
      bookData[index].id = id;
      bookData[index].title = title;
      bookData[index].author = author;
      bookData[index].year = year;
      bookData[index].isComplete = isComplete;
    }
  }
  localStorage.setItem(storageKey, JSON.stringify(bookData));
}


searchBook.addEventListener("submit", function (event) {
  event.preventDefault();
  const bookData = GetBookList();
  const notificationMessage = document.getElementById("notificationMessage");
  
  if (bookData.length === 0) {
    return;
  }

  const title = document.getElementById("searchBookTitle").value;
  if (title === "") { // jika input kosong, tampilkan seluruh buku
    RenderBookList(bookData);
    notificationMessage.innerText = ""; // Bersihkan pesan jika ada
    return;
  }

  const bookList = SearchBookList(title);
  
  if (bookList.length === 0) { // jika tidak ada buku yang ditemukan
    notificationMessage.innerText = "Buku tidak ditemukan"; // Tampilkan pesan di dalam div
    notificationMessage.classList.add("error"); // Tambahkan kelas jika perlu untuk styling
  } else {
    RenderBookList(bookList); // Jika buku ditemukan, render daftarnya
    notificationMessage.innerText = ""; // Bersihkan pesan jika ada
  }
});




function ResetAllForm() {
  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;

  document.getElementById("searchBookTitle").value = "";
}

window.addEventListener("load", function () {
  if (CheckForStorage) {
    if (localStorage.getItem(storageKey) !== null) {
      const bookData = GetBookList();
      RenderBookList(bookData);
    }
  } else {
    alert("Browser yang Anda gunakan tidak mendukung Web Storage");
  }
});
