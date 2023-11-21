<script setup>
import { onMounted, ref } from 'vue';
import { generateKeyFromFileName } from './../helper/file';

const dbName = 'default';

let file = null;

let filesToBeDisplayed = ref([]);

function changeFile(event) {
  file = event.target.files[0];
  console.log(file instanceof Blob);
  console.log('file variable is ready to use...');
}

async function addImage() {
  // Validate that file must not be null when trying to insert to indexed db
  if (file === null || !file.name) {
    alert("File can't be null!");
    return;
  }

  console.log('Adding image asynchronously...');

  // TODO We can extract the process of preparing database connection to external helper file to reduce code repetition
  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    console.error(
      'Error opening connection to indexed db:',
      event.target.error
    );
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    const objectStore = db.createObjectStore('images');
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    // Initiate database transaction
    const addTransaction = db.transaction('images', 'readwrite');
    const imagesObjectStore = addTransaction.objectStore('images');

    const fileKey = generateKeyFromFileName(file.name);

    const addRequest = imagesObjectStore.put(file, fileKey);

    addRequest.onsuccess = async (event) => {
      console.log('Data added successfully');

      /**
       * Re-call fetchImage to update filesToBeDisplayed
       * Should find a better approach, maybe directly append to the ref after successful insert
       */
      await fetchImage();

      file = null;
    };

    addRequest.onerror = (event) => {
      console.error('Error adding data', event.target.error);
    };

    addTransaction.oncomplete = () => {
      console.log('Completed');
      db.close();
    };
  };
}

async function fetchImage() {
  console.log('Fetching image asynchronously...');

  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    console.error(
      'Error opening connection to indexed db:',
      event.target.error
    );
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    const objectStore = db.createObjectStore('images');
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    // Initiate database transaction
    const getTransaction = db.transaction('images', 'readwrite');
    const imagesObjectStore = getTransaction.objectStore('images');

    imagesObjectStore.getAll().onsuccess = function (event) {
      /**
       * Store to vue state/ ref
       * filesToBeDisplayed will consists of array of object:
       * {
       *  key: string,
       *  src: string
       * }
       */
      const files = [];

      event.target.result.forEach((file) => {
        // Get window.URL object
        var URL = window.URL || window.webkitURL;

        // Create and revoke ObjectURL
        var imgURL = URL.createObjectURL(file);

        const fileObject = {
          key: generateKeyFromFileName(file.name),
          src: imgURL,
        };

        files.push(fileObject);
      });

      filesToBeDisplayed.value = files;
    };
  };
}

async function deleteImageByKey(key) {
  console.log('Delete image asynchronously...');

  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    console.error(
      'Error opening connection to indexed db:',
      event.target.error
    );
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    const objectStore = db.createObjectStore('images');
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    // Initiate database transaction
    const getTransaction = db.transaction('images', 'readwrite');
    const imagesObjectStore = getTransaction.objectStore('images');

    imagesObjectStore.delete(key).onsuccess = async function (event) {
      console.log('Deleted success');

      await fetchImage();
    };
  };
}

async function updateImageByKey(key) {
  // Validate that file must not be null when trying to insert to indexed db
  if (file === null || !file.name) {
    alert("File can't be null!");
    return;
  }

  console.log('Update image asynchronously...');

  // TODO We can extract the process of preparing database connection to external helper file to reduce code repetition
  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    console.error(
      'Error opening connection to indexed db:',
      event.target.error
    );
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    const objectStore = db.createObjectStore('images');
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    // Initiate database transaction
    const addTransaction = db.transaction('images', 'readwrite');
    const imagesObjectStore = addTransaction.objectStore('images');

    const addRequest = imagesObjectStore.put(file, key);

    addRequest.onsuccess = async (event) => {
      console.log('Data added successfully');

      /**
       * Re-call fetchImage to update filesToBeDisplayed
       * Should find a better approach, maybe directly append to the ref after successful insert
       */
      await fetchImage();

      file = null;
    };

    addRequest.onerror = (event) => {
      console.error('Error adding data', event.target.error);
    };

    addTransaction.oncomplete = () => {
      console.log('Completed');
      db.close();
    };
  };
}

// Execute fetchImage when the component is mounted
onMounted(fetchImage);
</script>

<template>
  <h1>Indexed DB Day 3 - Felix Andersen</h1>

  <input
    type="file"
    name="image"
    id="image"
    @change="(event) => changeFile(event)"
  />

  <button @click="addImage">Add image</button>

  <ul>
    <li
      style="
        list-style: none;
        list-style-type: none;
        margin-bottom: 12px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 16px;
      "
      v-for="(image, index) in filesToBeDisplayed"
    >
      <img
        :src="image.src"
        style="
          border-radius: 50%;
          height: 120px;
          width: 120px;
          object-fit: cover;
        "
      />

      <button type="button" @click="() => deleteImageByKey(image.key)">
        Delete Me!
      </button>

      <button type="button" @click="() => updateImageByKey(image.key)">
        Update Me!
      </button>
    </li>
  </ul>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
