let items = [];
let currentUser = null;
const API_URL = 'https://todos.mamarthsehrotra.workers.dev'; // Replace with your Cloudflare Worker URL
const approvedUsers = ['samarth']; // Add your approved usernames here

async function saveItems() {
    if (!currentUser) return;
    try {
        await fetch(`${API_URL}?user=${currentUser}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        });
    } catch (err) {
        console.error('Failed to save:', err);
    }
}

function renderItems() {
    const container = document.getElementById('listItems');
    container.innerHTML = '';
    
    const totalItems = items.length;
    
    items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'list-item';
        
        if (totalItems > 0) {
            const intensity = 1 - (index / totalItems);
            const opacity = Math.max(0.15, intensity);
            row.style.backgroundColor = `rgba(232, 90, 63, ${opacity})`;
            if (opacity > 0.5) {
                row.style.color = '#fff';
                row.setAttribute('data-bright', 'true');
            }
        }
        
        row.innerHTML = `
            <div class="col-product">${item.name}</div>
            <div class="col-actions">
                <button class="action-btn up-btn" ${index === 0 ? 'disabled' : ''} onclick="moveItem(${index}, -1)">↑</button>
                <button class="action-btn down-btn" ${index === items.length - 1 ? 'disabled' : ''} onclick="moveItem(${index}, 1)">↓</button>
                <button class="action-btn bin-btn" onclick="deleteItem(${index})">🗑</button>
            </div>
        `;
        
        container.appendChild(row);
    });
}

async function moveItem(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    await saveItems();
    renderItems();
}

async function deleteItem(index) {
    items.splice(index, 1);
    await saveItems();
    renderItems();
}

async function addItem(text) {
    if (!text.trim() || !currentUser) return;
    
    const newItem = {
        id: Date.now(),
        name: text.trim()
    };
    
    items.push(newItem);
    await saveItems();
    renderItems();
}

async function checkUsername(username) {
    const trimmed = username.trim();
    if (approvedUsers.includes(trimmed)) {
        currentUser = trimmed;
        const input = document.getElementById('newItemInput');
        input.placeholder = 'Add new item...';
        input.classList.remove('error');
        
        const errorMsg = document.getElementById('errorMsg');
        if (errorMsg) errorMsg.remove();
        
        const userSubscript = document.getElementById('userSubscript');
        if (userSubscript) {
            userSubscript.textContent = currentUser;
        }
        
        await fetchItems();
    } else {
        await fetch(url, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({content: log})
          });
        const input = document.getElementById('newItemInput');
        input.classList.add('error');
        
        let errorMsg = document.getElementById('errorMsg');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.id = 'errorMsg';
            errorMsg.className = 'error-msg';
            input.parentElement.appendChild(errorMsg);
        }
        errorMsg.textContent = 'username not present';
        
        setTimeout(() => {
            input.classList.remove('error');
            if (errorMsg) errorMsg.remove();
        }, 3000);
    }
}

async function fetchItems() {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_URL}?user=${currentUser}`);
        if (response.ok) {
            items = await response.json();
            renderItems();
        }
    } catch (error) {
        console.error('Failed to fetch items:', error);
    }
}

const input = document.getElementById('newItemInput');
input.placeholder = 'Enter user name';

input.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        if (!currentUser) {
            await checkUsername(e.target.value);
            e.target.value = '';
        } else {
            await addItem(e.target.value);
            e.target.value = '';
        }
    }
});