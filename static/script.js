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

    function displayShortenedUrl(longUrl, shortenedUrl) {
        const longUrlDisplay = document.getElementById('long_url_display');
        const shortUrlDisplay = document.getElementById('short_url_display');
        
        longUrlDisplay.href = longUrl;
        longUrlDisplay.target="_blank"
        longUrlDisplay.textContent = longUrl.length > 50 ? longUrl.slice(0, 35) + '...' + longUrl.slice(-14) : longUrl;
        
        shortUrlDisplay.href = shortenedUrl;
        shortUrlDisplay.target="_blank"
        shortUrlDisplay.textContent = shortenedUrl.slice(8);            // display shortened link after 'https://'
        fetchUserUrls();
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
            const shortenedUrl = responseJsonData.shortened_url;
            const error = responseJsonData.error;
            console.log(shortenedUrl);
            console.log(error);
            // error: or shortened_url:
            if (error){
                displayError(error);
            }
            if (shortenedUrl){
                displayShortenedUrl(longUrl, shortenedUrl);
            }
            else {
                displayError('Response Error. Pleae try again.');
            }
        } else {
            displayError("No response from Server");
        }
        // fetchUserUrls();
    }

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
                                            <input type="text" class="url-list-text-box custom-phrase url-part truncate p-0 text-white" value="${url.map_to}" readonly>
                                            <!--<input type="text" class="url-list-text-box custom-phrase url-part truncate p-1 bg-gray-700 text-white" value="${url.map_to}" readonly>-->
                                        </span>
                                        <button>${arrowIcon}</button>
                                        <input type="text" class="url-list-text-box long-url url-part truncate w-1/2 p-0 text-white" value="${url.map_of}" readonly>
                                        <!--<input type="text" class="url-list-text-box long-url url-part truncate w-1/2 p-1 bg-gray-700 text-white" value="${url.map_of}" readonly>-->
                                    </div>
                                    <div class="space-x-2">
                                        <button class="svg-button edit-button" alt="Edit" title="Edit">
                                            ${editIcon}
                                        </button>
                                        <button class="svg-button save-button hidden" alt="Save" title="Save">
                                            ${saveIcon}
                                        </button>
                                        <button class="svg-button cancel-button hidden" alt="Cancel" title="Cancel">
                                            ${cancelIcon}
                                        </button>
                                        <button class="svg-button delete-button" alt="Delete" title="Delete">
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
        const customPhraseInput = listItem.querySelector('.custom-phrase');
        const longUrlInput = listItem.querySelector('.long-url');
        const editButton = listItem.querySelector('.edit-button');
        const saveButton = listItem.querySelector('.save-button');
        const cancelButton = listItem.querySelector('.cancel-button');
        const deleteButton = listItem.querySelector('.delete-button');
    
        if (isEditing) {
            customPhraseInput.readOnly = false;
            longUrlInput.readOnly = false;
            customPhraseInput.classList.add('url-list-text-box-edit');
            longUrlInput.classList.add('url-list-text-box-edit');
            editButton.classList.add('hidden');
            saveButton.classList.remove('hidden');
            cancelButton.classList.remove('hidden');
            deleteButton.classList.add('hidden');
        } else {
            customPhraseInput.readOnly = true;
            longUrlInput.readOnly = true;
            editButton.classList.remove('hidden');
            saveButton.classList.add('hidden');
            cancelButton.classList.add('hidden');
            deleteButton.classList.remove('hidden');
        }
    }
    
    async function saveUrl(listItem, customPhrase) {
        const newCustomPhraseInput = listItem.querySelector('.custom-phrase');
        const newLongUrlInput = listItem.querySelector('.long-url');
    
        if (newCustomPhraseInput && newLongUrlInput) {
            const newCustomPhraseValue = newCustomPhraseInput.value;
            const newLongUrlValue = newLongUrlInput.value;
    
            try {
                const response = await fetch(`/update/${customPhrase}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        map_to: newCustomPhraseValue,
                        map_of: newLongUrlValue
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
            displayError('Please enter a URL');
        }
    }

    document.getElementById('shorten_btn').addEventListener('click', handleButtonClick);

    document.getElementById('modal').addEventListener('click', (event) => {
        if (event.target === document.getElementById('modal')) {
            document.getElementById('modal').classList.add('hidden');
        }
    });

    document.getElementById('close_btn').addEventListener('click', function() {
        document.getElementById('modal').classList.add('hidden');
    });

    // Copy Button
    document.getElementById('copy_btn').addEventListener('click', () => {
        const shortUrlDisplay = document.getElementById('short_url_display');
        const copyButton = document.getElementById('copy_btn');
        const shortUrlText = shortUrlDisplay.textContent;
        const shortUrlHref = shortUrlDisplay.href;
        // Copy the URL to the clipboard
        navigator.clipboard.writeText(shortUrlText)
            .then(() => {
                // Store the original text and dimensions
                const shortUrlWidth = shortUrlDisplay.offsetWidth;
                const copyButtonWidth = copyButton.offsetWidth;
                const newWidth = shortUrlWidth + copyButtonWidth;
                
                // Maintain the original width and height
                shortUrlDisplay.style.width = `${newWidth}px`;
                copyButton.style.display = 'none';

                // Temporarily change the text to 'Copied'
                shortUrlDisplay.textContent = 'Copied';
                shortUrlDisplay.removeAttribute('href');
    
                // Revert to the original text after 0.5 seconds
                setTimeout(() => {
                    shortUrlDisplay.textContent = shortUrlText;
                    shortUrlDisplay.href = shortUrlHref;
                    shortUrlDisplay.style.width = ''; // Remove width style
                    shortUrlDisplay.style.height = ''; // Remove height style
                    // shortUrlDisplay.removeProperty('style');
                    copyButton.style.display = 'inline-block'; // Show the copy button again
                }, 500);
            })
            .catch(err => console.error('Failed to copy URL:', err));
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
