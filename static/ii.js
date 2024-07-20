document.addEventListener('DOMContentLoaded', () => {

    fetchUserUrls();

    function getLongUrl() {
        return document.getElementById('longURLTextField').value;
    }

    function getCustomPhrase() {
        const customPhraseTextField = document.getElementById('customPhraseTextField');
        const value = customPhraseTextField?.value || '';
        return value;
    }

    function displayShortenedUrl(shortenedUrl) {
        const shortUrlDisplay = document.getElementById('short_url_display');
        shortUrlDisplay.textContent = `${shortenedUrl}`;
        const modal = document.getElementById('modal');
        modal.classList.remove('hidden');
    }

    function displayError(message) {
        const errorMessage = document.getElementById('error_message');
        errorMessage.textContent = message;
    }

    async function shortenUrl(longUrl) {
        let response;
        const customPhrase = getCustomPhrase();
        if (customPhrase) {
            if (isAuthenticated) {
                response = await fetch('/custompico/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        ori_url: longUrl,
                        short_phrase: customPhrase
                    }),
                });
            } else {
                displayError('Please sign in to create a custom PicoURL');
                return;
            }
        } else {
            response = await fetch(`/get/${longUrl}`);
        }

        if (response.ok) {
            const responseJsonData = await response.json();
            // error: or shortened_url:
            const shortenedUrl = responseJsonData.shortened_url;
            displayShortenedUrl(shortenedUrl);
        } else {
            displayError("No response from Server");
        }
        fetchUserUrls();
    }

    // function fetchUserUrls() {
    //     if (isAuthenticated) {
    //         fetch('/load/')
    //             .then(response => response.json())
    //             .then(urls => {
    //                 const urlsList = document.getElementById('urls-list');
    //                 urlsList.innerHTML = '';
    //                 if (urls.length === 0){
    //                     urlsList.innerHTML = '<p class="text-white text-center">You don\'t have any custom PicoLinks. Make your first one!</p>';
    //                 }
    //                 else {
    //                     urls.forEach(url => {
    //                     const listItem = document.createElement('li');
    //                     listItem.classList.add('flex', 'justify-between', 'items-center', 'p-2', 'bg-gray-800', 'rounded');
    //                     listItem.innerHTML = `
    //                         <div class="flex-1 flex items-center space-x-2">
    //                             <span class="flex items-center">
    //                                 <span class="static-text">getPico.Link/</span>
    //                                 <input type="text" class="url-list-text-box custom-phrase url-part truncate p-1 bg-gray-700 text-white" value="${url.map_to}" readonly>
    //                             </span>
    //                             <input type="text" class="url-list-text-box long-url url-part truncate w-1/2 p-1 bg-gray-700 text-white" value="${url.map_of}" readonly>
    //                         </div>
    //                         <div class="space-x-2">
    //                             <!--<button class="edit-button px-2 py-1 bg-blue-500 text-white rounded">Edit</button>-->
    //                             <svg class = "edit-button" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="1" d="M4 20H8L18 10L14 6L4 16V20Z" fill="#808080"></path> <path d="M18 10L21 7L17 3L14 6M18 10L8 20H4V16L14 6M18 10L14 6" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>

    //                             <button class="save-button px-2 py-1 bg-green-500 text-white rounded hidden">Save</button>
    //                             <button class="cancel-button px-2 py-1 bg-yellow-500 text-white rounded hidden">Cancel</button>
    //                             <button class="delete-button px-2 py-1 bg-red-500 text-white rounded">Delete</button>
    //                         </div>
    //                     `;
    //                     listItem.querySelector('.edit-button').onclick = () => toggleEdit(listItem, true);
    //                     listItem.querySelector('.save-button').onclick = () => saveUrl(listItem, url.map_to);
    //                     listItem.querySelector('.cancel-button').onclick = () => cancelEdit(listItem);
    //                     listItem.querySelector('.delete-button').onclick = () => deleteUrl(url.map_to);
    //                     urlsList.appendChild(listItem);
    //                     });
    //                 }
    //             });
    //     }
    // }
    async function fetchSVG(url) {
        return fetch(url)
            .then(response => response.text())
            .catch(error => console.error('Error fetching SVG:', error));
    }
    
    function fetchUserUrls() {
        if (isAuthenticated) {
            fetch('/load/')
                .then(response => response.json())
                .then(urls => {
                    const urlsList = document.getElementById('urls-list');
                    urlsList.innerHTML = '';
                    if (urls.length === 0){
                        urlsList.innerHTML = '<p class="text-white text-center">You don\'t have any custom PicoLinks. Make your first one!</p>';
                    }
                    else {
                        Promise.all([
                            fetchSVG('static/icons/edit-icon.svg'),
                            fetchSVG('static/icons/save-icon.svg'),
                            fetchSVG('static/icons/cancel-icon.svg'),
                            fetchSVG('static/icons/delete-icon.svg'),
                            fetchSVG('static/icons/arrow-icon.svg')
                        ]).then(([editIcon, saveIcon, cancelIcon, deleteIcon, arrowIcon]) => {
                            urls.forEach(url => {
                                const listItem = document.createElement('li');
                                listItem.classList.add('flex', 'justify-between', 'items-center', 'p-2', 'bg-gray-800', 'rounded');
                                listItem.innerHTML = `
                                    <div class="flex-1 flex items-center space-x-2">
                                        <span class="flex items-center">
                                            <span class="static-text">getPico.Link/</span>
                                            <input type="text" class="url-list-text-box custom-phrase url-part truncate p-1 bg-gray-700 text-white" value="${url.map_to}" readonly>
                                        </span>
                                        <button>${arrowIcon}</button>
                                        <input type="text" class="url-list-text-box long-url url-part truncate w-1/2 p-1 bg-gray-700 text-white" value="${url.map_of}" readonly>
                                    </div>
                                    <div class="space-x-2">
                                        <!-- Edit Button -->
                                        <button class="edit-button" aria-label="Edit">
                                            ${editIcon}
                                        </button>
                                        <!-- Save Button -->
                                        <button class="save-button hidden" aria-label="Save">
                                            ${saveIcon}
                                        </button>
                                        <!-- Cancel Button -->
                                        <button class="cancel-button hidden" aria-label="Cancel">
                                            ${cancelIcon}
                                        </button>
                                        <!-- Delete Button -->
                                        <button class="delete-button" aria-label="Delete">
                                            ${deleteIcon}
                                        </button>
                                    </div>
                                `;
                                listItem.querySelector('.edit-button').onclick = () => toggleEdit(listItem, true);
                                listItem.querySelector('.save-button').onclick = () => saveUrl(listItem, url.map_to);
                                listItem.querySelector('.cancel-button').onclick = () => cancelEdit(listItem);
                                listItem.querySelector('.delete-button').onclick = () => deleteUrl(url.map_to);
                                urlsList.appendChild(listItem);
                            });
                        });
                    }
                });
            displayError('');
        }
    }
    
    
      
    function toggleEdit(listItem, isEditing) {
        const urlInput = listItem.querySelector('.custom-phrase');
        const longUrlInput = listItem.querySelector('.long-url');
        const editButton = listItem.querySelector('.edit-button');
        const saveButton = listItem.querySelector('.save-button');
        const cancelButton = listItem.querySelector('.cancel-button');
        const deleteButton = listItem.querySelector('.delete-button');
    
        if (isEditing) {
            urlInput.readOnly = false;
            longUrlInput.readOnly = false;
            editButton.classList.add('hidden');
            saveButton.classList.remove('hidden');
            cancelButton.classList.remove('hidden');
            deleteButton.classList.add('hidden');
        } else {
            urlInput.readOnly = true;
            longUrlInput.readOnly = true;
            editButton.classList.remove('hidden');
            saveButton.classList.add('hidden');
            cancelButton.classList.add('hidden');
            deleteButton.classList.remove('hidden');
        }
    }
    
    async function saveUrl(listItem, customPhrase) {
        const urlInput = listItem.querySelector('.custom-phrase');
        const longUrlInput = listItem.querySelector('.long-url');
    
        if (urlInput && longUrlInput) {
            const urlValue = urlInput.value;
            const longUrlValue = longUrlInput.value;
    
            try {
                const response = await fetch(`/update/${customPhrase}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        map_to: urlValue,
                        map_of: longUrlValue
                    }),
                });
    
                if (response.ok) {
                    toggleEdit(listItem, false);
                    fetchUserUrls();
                } else {
                    displayError("Error updating URL");
                }
            } catch (error) {
                displayError("Error updating URL");
            }
        } else {
            displayError("Error: URL input fields are missing");
        }
    }

    function cancelEdit(listItem) {
        toggleEdit(listItem, false);
        fetchUserUrls();
    }

    async function deleteUrl(customPhrase) {
        try {
            const response = await fetch(`/delete/${customPhrase}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
            });

            if (response.ok) {
                fetchUserUrls(); // Refresh the list after deletion
            } else {
                displayError("Error deleting URL");
            }
        } catch (error) {
            displayError("Error deleting URL");
        }
    }

    function handleButtonClick(event) {
        event.preventDefault();
        const longUrl = getLongUrl();

        if (longUrl) {
            shortenUrl(longUrl);
        } else {
            displayError('Error: Please enter a URL');
        }
    }

    document.getElementById('shorten_btn').addEventListener('click', handleButtonClick);

    document.getElementById('modal').addEventListener('click', (event) => {
        if (event.target === document.getElementById('modal')) {
            document.getElementById('modal').classList.add('hidden');
        }
    });

    document.getElementById('copy_btn').addEventListener('click', () => {
        const shortUrl = document.getElementById('short_url_display').textContent;
        navigator.clipboard.writeText(shortUrl)
            .then(() => alert('Shortened URL copied to clipboard!'))
            .catch(err => displayError('Failed to copy URL'));
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
