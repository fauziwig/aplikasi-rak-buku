document.addEventListener('DOMContentLoaded', function() {
    const inputBookForm = document.getElementById('inputBook');
    const inputBookIsCompleteCheckbox = document.getElementById('inputBookIsComplete');
    const searchBookForm = document.getElementById('searchBook');
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');


    inputBookForm.addEventListener('submit', function(event) {
      event.preventDefault();
      addBook();
    });
  
    searchBookForm.addEventListener('submit', function(event) {
      event.preventDefault();
      searchBook();
    });
  
    // load buku dari local storage ke
    loadBooks();

    // handler tambah buku 
    function addBook() {
      const title = document.getElementById('inputBookTitle').value;
      const author = document.getElementById('inputBookAuthor').value;
      const year = document.getElementById('inputBookYear').value;
      const isComplete = document.getElementById('inputBookIsComplete').checked;

      const id = +new Date();

      // buat objek buku baru
      const newBook = {
        id: id,
        title: title,
        author: author,
        year: parseInt(year), 
        isComplete: isComplete
      };

      
      // Membuat elemen buku baru dan menambahkannya ke rak yang sesuai
      const bookItem = makeBook(newBook);
      if (isComplete) {
        completeBookshelfList.appendChild(bookItem);
      } else {
        incompleteBookshelfList.appendChild(bookItem);
      }

      //simpan data buku baru ke local storage
      saveBookToLocalStorage(newBook);
    }

    
  
    function makeBook(newBookData) {
      const bookItem = document.createElement('article');
      bookItem.classList.add('book_item');

      bookItem.dataset.id = newBookData.id;
  
      const bookTitle = document.createElement('h3');
      bookTitle.innerText = newBookData.title;
  
      const bookAuthor = document.createElement('p');
      bookAuthor.innerText = 'Penulis: ' + newBookData.author;
  
      const bookYear = document.createElement('p');
      bookYear.innerText = 'Tahun: ' + newBookData.year;
  
      const actionDiv = document.createElement('div');
      actionDiv.classList.add('action');
  
      const buttonComplete = document.createElement('button');
      buttonComplete.innerText = newBookData.isComplete ? 'Belum selesai di Baca' : 'Selesai dibaca';
      buttonComplete.classList.add(newBookData.isComplete ? 'green' : 'red');
      buttonComplete.addEventListener('click', function() {
        moveBook(this.parentElement.parentElement, newBookData.isComplete);
      });
  
      const buttonDelete = document.createElement('button');
      buttonDelete.innerText = 'Hapus buku';
      buttonDelete.classList.add('red');
      buttonDelete.addEventListener('click', function() {
        showDeleteConfirmation(this.parentElement.parentElement);
      });
  
      actionDiv.appendChild(buttonComplete);
      actionDiv.appendChild(buttonDelete);
  
      bookItem.appendChild(bookTitle);
      bookItem.appendChild(bookAuthor);
      bookItem.appendChild(bookYear);
      bookItem.appendChild(actionDiv);
  
      return bookItem;
    }
    
    // handler pindah buku ke 'selesai baca' atau 'belum selesai'
    function moveBook(bookItem, isComplete) {
      const bookshelfDestination = isComplete ? incompleteBookshelfList : completeBookshelfList;
      const buttonComplete = bookItem.querySelector('.action button:first-child');
      const buttonText = isComplete ? 'Selesai dibaca' : 'Belum selesai di Baca';
  
      bookshelfDestination.appendChild(bookItem);
      buttonComplete.innerText = buttonText;
      buttonComplete.classList.toggle('green');
      buttonComplete.classList.toggle('red');
      buttonComplete.addEventListener('click', function() {
        moveBook(this.parentElement.parentElement, !isComplete);
      });

      // Mengambil data buku dari atribut data
      const bookData = {
        id: bookItem.dataset.id,
        title: bookItem.querySelector('h3').innerText,
        author: bookItem.querySelector('p:nth-child(2)').innerText.replace('Penulis: ', ''),
        year: bookItem.querySelector('p:nth-child(3)').innerText.replace('Tahun: ', ''),
        isComplete: isComplete
      };

      saveBookToLocalStorage(bookData);
    }

    function saveBookToLocalStorage(bookData) {
      let books = JSON.parse(localStorage.getItem('books')) || [];
  
      const existingBookIndex = books.findIndex(book => book.id === bookData.id);
  
      if (existingBookIndex !== -1) {
        books[existingBookIndex] = bookData; 
      } else {
        books.push(bookData); 
      }
  
      localStorage.setItem('books', JSON.stringify(books));
    }

    function loadBooks() {
      const books = JSON.parse(localStorage.getItem('books')) || [];
  
      books.forEach(book => {
        const bookItem = makeBook(book);
        if (book.isComplete) {
          completeBookshelfList.appendChild(bookItem);
        } else {
          incompleteBookshelfList.appendChild(bookItem);
        }
      });
    }
    
    // handler hapus buku
    function deleteBook(bookItem) {
      const bookId = bookItem.dataset.id; 
      bookItem.remove();
      
      removeBookFromLocalStorage(bookId);
    }

    function removeBookFromLocalStorage(bookId) {
      let books = JSON.parse(localStorage.getItem('books')) || [];

      const bookIndex = books.findIndex(item =>item.id == bookId);
      
      if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        localStorage.setItem('books', JSON.stringify(books)); 
      }
    }

    function showDeleteConfirmation(bookItem) {
      const modal = document.getElementById('deleteConfirmationModal');
      modal.style.display = 'block';
    
      const confirmDeleteButton = document.getElementById('confirmDelete');
      const cancelDeleteButton = document.getElementById('cancelDelete');
    
      confirmDeleteButton.onclick = function() {
        deleteBook(bookItem);
        modal.style.display = 'none'; 
      };
    
      cancelDeleteButton.onclick = function() {
        modal.style.display = 'none'; 
      };
    }
    

  
    // handler cari buku
    function searchBook() {
      const title = document.getElementById('searchBookTitle').value.toLowerCase();
      const books = document.querySelectorAll('.book_item');
      let found = false; 
  
      books.forEach((book)=>{
        const bookTitle = book.querySelector('h3').innerText.toLowerCase();
        if (bookTitle.includes(title)) {
          book.style.display = 'block';
          found = true; 
        } else {
          book.style.display = 'none';
        }
      });

      const notFindElement = document.getElementById('notFind');

      if (!found) {
        notFindElement.style.display = 'block';
      } else {
        notFindElement.style.display = 'none';
      }
    }
  });
  