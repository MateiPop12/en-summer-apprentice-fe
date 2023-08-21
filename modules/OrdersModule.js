let editModeEnabled = false;
// toastr.options = {
//     positionClass: 'toast-top-right', // Position of the toast
//     closeButton: true,               // Show a close button
// };

export async function fetchOrders(){
    const response = await fetch('http://localhost:8080/order/all');
    return await response.json();
}
export const addOrders = (orderList) => {
    const orderListDiv = document.querySelector('.order-list');
    orderListDiv.innerHTML = ''; // Clear existing content
    const searchBarDiv = document.createElement('div');
    // eventsListDiv.innerHTML = ''; // Clear existing content
    searchBarDiv.classList.add('searchbar-div');
    searchBarDiv.innerHTML = `
        <input class="searchbar" type="search">
            <i class="fa-solid fa-magnifying-glass fa-lg"></i>
        </input>
    `;
    orderListDiv.appendChild(searchBarDiv)

    const searchbar = document.querySelector('.searchbar');

    searchbar.addEventListener('input', () => {
        const searchTerm = searchbar.value.trim(); // Trim whitespace and get the search term
        filterOrdersByEventName(searchTerm);
    });

    if (orderList.length) {
        orderList.forEach((order) => {
            const eventCard = createOrder(order, orderListDiv);
            orderListDiv.appendChild(eventCard);
        });
    } else {
        orderListDiv.innerHTML = 'No orderList';
    }
};

const createOrder = (orderData, orderListDiv) => {
    const {eventDto,orderID,orderedAt,ticketCategory,numberOfTickets,totalPrice} = orderData;

    let selectedCategoryID = ticketCategory.ticketCategoryID;
    let initialTicketCategoryID = ticketCategory.ticketCategoryID; // Capture initial ticket category ID
    let initialNumberOfTickets = numberOfTickets; // Capture initial number of tickets

    const eventCard = document.createElement('div');
    eventCard.classList.add('order-card');

    // Create the event content markup
    const title = document.createElement('h4');
    title.classList.add("order-title");
    title.textContent = `${eventDto.eventName}`;

    const actionsWrapper = document.createElement('div');
    actionsWrapper.classList.add('actions-wrapper');


    const ticketTypeWrapper = document.createElement('div');
    ticketTypeWrapper.classList.add('order-ticket-type-wrapper');
    const selectOptions = eventDto.ticketCategoryList.map(category => `<option value="${category.ticketCategoryID}">${category.ticketCategoryDescription}</option>`).join('');
    ticketTypeWrapper.innerHTML = `
        <select id="ticketType" class="order-ticket-type">
            ${selectOptions}
        </select>
    `;

    const priceLabel = document.createElement('label');
    priceLabel.classList.add('order-price-label');
    priceLabel.id = "priceLabel";
    priceLabel.textContent = `${ticketCategory.ticketCategoryPrice}`;

    ticketTypeWrapper.appendChild(priceLabel);

    const ticketTypeSelect = ticketTypeWrapper.querySelector(".order-ticket-type");


    //III
    const ticketNumberWrapper = document.createElement('div');
    ticketNumberWrapper.classList.add('order-ticket-number-wrapper');

    const ticketNumber = document.createElement('input');
    ticketNumber.classList.add('order-number-input');
    ticketNumber.type = 'number';
    ticketNumber.min = '1';
    ticketNumber.value = `${numberOfTickets}`;
    initialNumberOfTickets = parseInt(ticketNumber.value);
    ticketNumber.addEventListener('input', () => {
        updateTotalPrice();
    });

    const totalPriceLabel = document.createElement('label');
    totalPriceLabel.classList.add('order-price-label');
    totalPriceLabel.textContent = `Total Price: ${totalPrice.toFixed(2)}`;

    const incBtn = document.createElement('button');
    incBtn.innerHTML=`<i class="fa-solid fa-plus fa-lg" style="color: #3f2305"></i>`
    incBtn.classList.add("order-inc-dec-btn")
    incBtn.addEventListener('click', () => {
        ticketNumber.value = parseInt(ticketNumber.value) + 1;
        updateTotalPrice();
    });

    const decBtn = document.createElement('button');
    decBtn.innerHTML=`<i class="fa-solid fa-minus fa-lg" style="color: #3f2305"></i>`
    decBtn.classList.add("order-inc-dec-btn")
    decBtn.addEventListener('click', () => {
        const currentValue = parseInt(ticketNumber.value);
        if(currentValue > 1) {
            ticketNumber.value = currentValue -1;
            updateTotalPrice();
        }
    });
    // const orderedAtDiv = document.createElement('p');
    // orderedAtDiv.classList.add('ordered-at');
    // orderedAtDiv.textContent = orderedAt;

    const btnWrapper = document.createElement('div');
    btnWrapper.classList.add('btn-wrapper');

    const revertBtn = document.createElement('button');
    revertBtn.classList.add('edit-delete-btn');
    revertBtn.classList.add('revert');
    revertBtn.innerHTML = '<i class="fa-regular fa-rectangle-xmark fa-2xl"></i>'
    revertBtn.addEventListener('click',()=>{
        console.log("Before revert:", {
            initialTicketCategoryID,
            initialNumberOfTickets,
            selectedCategoryID,
            ticketTypeSelectValue: ticketTypeSelect.value
        });

        ticketTypeSelect.disabled = true;
        ticketNumber.disabled = true;
        incBtn.disabled = true;
        decBtn.disabled = true;

        // Reset select dropdown to initial value
        ticketTypeSelect.value = ticketCategory.ticketCategoryID;
        selectedCategoryID = ticketCategory.ticketCategoryID;

        // Reset input for number of tickets to initial value
        ticketNumber.value = numberOfTickets;

        updatePrice();
        updateTotalPrice();
        console.log("After revert:", {
            initialTicketCategoryID,
            initialNumberOfTickets,
            selectedCategoryID,
            ticketTypeSelectValue: ticketTypeSelect.value
        });

        revertBtn.classList.toggle('revert');
        saveBtn.classList.toggle('revert');
        editBtn.classList.toggle('revert');
    });
    const saveBtn = document.createElement('button');
    saveBtn.classList.add('edit-delete-btn');
    saveBtn.classList.add('revert');
    saveBtn.innerHTML = '<i class="fa-regular fa-square-check fa-2xl"></i>'
    saveBtn.addEventListener('click',()=>{
        editModeEnabled = false; // Disable edit mode
        ticketTypeSelect.disabled = true;
        ticketNumber.disabled = true;
        incBtn.disabled=true;
        decBtn.disabled=true;
        revertBtn.classList.toggle('revert');
        saveBtn.classList.toggle('revert');
        editBtn.classList.toggle('revert');
        updateTotalPrice();
        updatePrice();
        const updatedTicketCategoryId = parseInt(ticketTypeSelect.value);
        const updatedNumberOfTickets = parseInt(ticketNumber.value);

        // Prepare the request body
        const requestBody = {
            orderId: orderID,
            ticketCategoryId: updatedTicketCategoryId,
            numberOfTickets: updatedNumberOfTickets
        };

        // Send PUT request to update the order
        updateOrder(requestBody);
    });

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-delete-btn');
    editBtn.innerHTML=`<i class="fa-regular fa-pen-to-square fa-2xl"></i>`
    editBtn.addEventListener('click', () => {
            editModeEnabled = true; // Enable edit mode
            ticketTypeSelect.disabled = false;
            ticketNumber.disabled = false;
            incBtn.disabled=false;
            decBtn.disabled=false;
            revertBtn.classList.toggle('revert');
            saveBtn.classList.toggle('revert');
            editBtn.classList.toggle('revert');
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('edit-delete-btn');
    deleteBtn.innerHTML='<i class="fa-solid fa-trash-can fa-2xl"></i>'
    deleteBtn.addEventListener('click', () => {
        // Call a function to delete the order
        deleteOrder(orderID); // Pass the order ID to the function
    });

    function updateTotalPrice() {
        const selectedCategory = eventDto.ticketCategoryList.find(category => category.ticketCategoryID === selectedCategoryID);
        const ticketCount = parseInt(ticketNumber.value);

        if (selectedCategory) {
            const totalPriceValue = selectedCategory.ticketCategoryPrice * ticketCount;
            totalPriceLabel.textContent = `Total Price: ${totalPriceValue.toFixed(2)}`;
        } else {
            totalPriceLabel.textContent = "Total Price: N/A";
        }
    }
    function updatePrice() {
        const selectedCategory = eventDto.ticketCategoryList.find(category => category.ticketCategoryID === selectedCategoryID);

        if (selectedCategory) {
            priceLabel.textContent = `Price: ${selectedCategory.ticketCategoryPrice}`;
        } else {
            priceLabel.textContent = "N/A";
        }
    }

    if (ticketTypeSelect) {
        ticketTypeSelect.addEventListener("change", () => {
            selectedCategoryID = parseInt(ticketTypeSelect.value);
            initialTicketCategoryID = selectedCategoryID;
            updatePrice();
            updateTotalPrice();
        });

        // Preselect the ticket category from orderData
        if (ticketTypeSelect.options.length > 0) {
            // Find the index of the ticket category in the options
            const initialCategoryIndex = eventDto.ticketCategoryList.findIndex(category => category.ticketCategoryID === ticketCategory.ticketCategoryID);

            if (initialCategoryIndex !== -1) {
                selectedCategoryID = parseInt(ticketCategory.ticketCategoryID);
                ticketTypeSelect.selectedIndex = initialCategoryIndex; // Set the selected index
                updatePrice();
                updateTotalPrice();
            }
        }
    }

    ticketTypeSelect.disabled = true;
    ticketNumber.disabled = true;
    incBtn.disabled=true;
    decBtn.disabled=true;

    ticketNumberWrapper.appendChild(decBtn);
    ticketNumberWrapper.appendChild(ticketNumber);
    ticketNumberWrapper.appendChild(incBtn);
    ticketNumberWrapper.appendChild(totalPriceLabel);

    btnWrapper.appendChild(editBtn);
    btnWrapper.appendChild(saveBtn);
    btnWrapper.appendChild(revertBtn);
    btnWrapper.appendChild(deleteBtn);

    eventCard.appendChild(title);
    eventCard.appendChild(ticketTypeWrapper);
    eventCard.appendChild(ticketNumberWrapper);
    // eventCard.appendChild(orderedAtDiv);
    eventCard.appendChild(btnWrapper);

    orderListDiv.appendChild(eventCard);
    return eventCard;
};

const deleteOrder = (orderID) => {
    const deleteEndpoint = `http://localhost:8080/order/delete/${orderID}`;

    fetch(deleteEndpoint, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                console.log('Order deleted successfully.');
                toastr.success('Order deleted successfully.'); // Display a success toast
                location.reload();
            } else {
                console.error('Failed to delete order.');
                toastr.error('Failed to delete order.'); // Display an error toast
            }
        })
        .catch(error => {
            console.error('An error occurred:', error);
            toastr.error('An error occurred.'); // Display an error toast
        });
};

const updateOrder = (requestBody) => {
    const updateEndpoint = 'http://localhost:8080/order/update';

    fetch(updateEndpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (response.ok) {
                console.log('Order updated successfully.');
                toastr.success('Order updated successfully.');// Display a success toast
                location.reload(); // Refresh the page after successful update
            } else {
                console.error('Failed to update order.');
                toastr.error('Failed to update order.'); // Display an error toast
            }
        })
        .catch(error => {
            console.error('An error occurred:', error);
            toastr.error('An error occurred.'); // Display an error toast
        });
};

function filterOrdersByEventName(searchTerm) {
    const orderCards = document.querySelectorAll('.order-card');
    const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive search

    orderCards.forEach(orderCard => {
        const eventName = orderCard.querySelector('.order-title').textContent;

        if (searchRegex.test(eventName)) {
            orderCard.style.display = 'flex'; // Show matching cards
        } else {
            orderCard.style.display = 'none'; // Hide non-matching cards
        }
    });
}
