let selectedCategoryID = null;
export async function fetchEvents(){
    const response = await fetch('http://localhost:8080/event/all');
    return await response.json();
}
function sendOrderData(data) {
    console.log('Sending POST request...');
    fetch(`http://localhost:8080/order/create/2`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any other headers as needed
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json()
        )
        .then(responseData => {
            // Handle the response from the server
            console.log('Order placed:', responseData);
            // You can update the UI or show a confirmation message here
        })
        .catch(error => {
            console.error('Error placing order:', error);
            // Handle the error here
        });
}
export const addEvents = (eventList) => {
    const eventsListDiv = document.querySelector('.event-list');
    const popupDiv = document.querySelector('.popup');
    const searchBarDiv = document.createElement('div');
    // eventsListDiv.innerHTML = ''; // Clear existing content
    searchBarDiv.classList.add('searchbar-div');
    searchBarDiv.innerHTML =
        `<input class="searchbar" type="search">
            <i class="fa-solid fa-magnifying-glass fa-lg"></i>
         </input>
        `;
    eventsListDiv.appendChild(searchBarDiv);

    const searchbar = document.querySelector('.searchbar');
    searchbar.addEventListener('input', () => {
        const searchTerm = searchbar.value.trim(); // Trim whitespace and get the search term
        filterEventsByName(searchTerm);
    });

    if (eventList.length) {
        eventList.forEach((event) => {
            const eventCard = createEvent(event, eventsListDiv);
            eventsListDiv.appendChild(eventCard);
            eventCard.addEventListener('click', () => {
                // Code to handle the click event for the event card
                // You can define what should happen when an event card is clicked
                console.log(eventCard.id);
                const eventPopup = createPopup(event,popupDiv);
                popupDiv.style.display = 'flex';
                popupDiv.appendChild(eventPopup);
            });
        });
    } else {
        eventsListDiv.innerHTML = 'No events';
    }
};
const createEvent = (eventData, eventsDiv) => {
    const { eventID,eventName, eventDescription, venue, eventStartDate, eventEndDate} = eventData;

    const eventCard = document.createElement('div');
    eventCard.id = eventID;
    eventCard.classList.add('event-card');

    // Create the event content markup
    eventCard.innerHTML = `
      <h1 class="eventName">${eventName}</h1>
      <img src="resources/ticket.png" alt="">
      <div class="eventDescription format">${eventDescription}</div>
      <div class="venueLocation format">
        <i class="fa-solid fa-location-dot"></i>
        ${venue.venueLocation}
      </div>
      <div class="event-container">
        <div class="eventStartDate format">
            <i class="fa fa-calendar"></i>
            ${eventStartDate}
        </div>
        <div class="eventEndDate format">
            <i class="fa fa-calendar"></i>
            ${eventEndDate}
        </div>
      </div>
    `;
    eventsDiv.appendChild(eventCard);
    return eventCard;
};

const createPopup = (eventData,popupDiv) =>{
    const {eventID,eventName,ticketCategoryList} = eventData;
    const isSingleTicket = ticketCategoryList.length === 1;
    const popup = document.createElement('div');
    //popup.id = eventID;
    popup.classList.add('popup-card');
    popup.classList.add('active');

    //I
    const title = document.createElement('h2');
    title.classList.add("title");
    title.textContent = `${eventName}`;

    //Order now
    const orderBtn = document.createElement('button');
    orderBtn.classList.add("order-now-btn");
    orderBtn.textContent = "Order Now";
    orderBtn.disabled = true;

    function updateOrderButtonState() {
        const currentQuantity = parseInt(ticketNumber.value);
        const selectedCategory = ticketCategoryList.find(category => category.ticketCategoryID === selectedCategoryID);

        if (selectedCategory && currentQuantity > 0 && currentQuantity <= selectedCategory.venue.venueCapacity) {
            orderBtn.disabled = false;
        } else {
            orderBtn.disabled = true;
        }
    }

    orderBtn.addEventListener('click', () => {
        const selectedCategory = ticketCategoryList.find(category => category.ticketCategoryID === selectedCategoryID);
        const ticketCount = parseInt(ticketNumber.value);

        if (selectedCategory && ticketCount > 0) {
            const orderData = {
                eventID: +eventID,
                ticketCategoryID: +selectedCategory.ticketCategoryID,
                numberOfTickets: +ticketCount,
                // Add more data as needed
            };
            try{
            // Send the data with a POST request
                console.log(orderData);
                sendOrderData(orderData);
            }catch (error){
                console.error('Error making POST request:', error);
                return false;
            }
        }

        popupDiv.style.display = 'none'; // Hide the popup
        popupDiv.removeChild(popup); // Remove the popup content from the DOM

    });

    //exit btn
    const exitBtn = document.createElement("button");
    exitBtn.innerHTML = `<i class="fa-solid fa-x fa-2xl"></i>`;
    exitBtn.addEventListener("click", () => {
        popupDiv.style.display = 'none'; // Hide the popup
        popupDiv.removeChild(popup); // Remove the popup content from the DOM
    });

    const img = document.createElement('img');
    img.src = "resources/ticket.png"

    const actionsWrapper = document.createElement('div');
    actionsWrapper.classList.add('actions-wrapper');

    //II
    console.log(ticketCategoryList);
    console.log(isSingleTicket)

    const ticketTypeWrapper = createTicketCategorySelection(ticketCategoryList);

    //III
    const ticketNumberWrapper = document.createElement('div');
    ticketNumberWrapper.classList.add('ticket-number-wrapper');

    const ticketNumber = document.createElement('input');
    ticketNumber.classList.add('number-input');
    ticketNumber.type = 'number';
    ticketNumber.min = '0';
    ticketNumber.value = '0';
    ticketNumber.addEventListener('input', () => {
        updateTotalPrice();
        updateOrderButtonState(); // Call the function to update the button state
    });


    const totalPrice = document.createElement('label');
    totalPrice.textContent = "Total Price: 0.0";

    const incBtn = document.createElement('button');
    incBtn.innerHTML=`<i class="fa-solid fa-plus fa-2xs" style="color: #3f2305"></i>`
    incBtn.classList.add("inc-dec-btn")
    incBtn.addEventListener('click', () => {
        ticketNumber.value = parseInt(ticketNumber.value) + 1;
        updateTotalPrice();
        updateOrderButtonState();
    });

    const decBtn = document.createElement('button');
    decBtn.innerHTML=`<i class="fa-solid fa-minus fa-2xs" style="color: #3f2305"></i>`
    decBtn.classList.add("inc-dec-btn")
    decBtn.addEventListener('click', () => {
        const currentValue = parseInt(ticketNumber.value);
        if(currentValue > 0) {
            ticketNumber.value = currentValue -1;
            updateTotalPrice();
            updateOrderButtonState();
        }
    });

    function updateTotalPrice() {
        const selectedCategory = ticketCategoryList.find(category => category.ticketCategoryID === selectedCategoryID);
        const ticketCount = parseInt(ticketNumber.value);

        if (selectedCategory) {
            const totalPriceValue = selectedCategory.ticketCategoryPrice * ticketCount;
            totalPrice.textContent = `Total Price: ${totalPriceValue.toFixed(2)}`;
        } else {
            totalPrice.textContent = "Total Price: N/A";
        }
    }

    function updateOrderButtonState() {
        const currentQuantity = parseInt(ticketNumber.value);
        orderBtn.disabled = currentQuantity <= 0;
    }

    ticketNumberWrapper.appendChild(decBtn);
    ticketNumberWrapper.appendChild(ticketNumber);
    ticketNumberWrapper.appendChild(incBtn);
    ticketNumberWrapper.appendChild(totalPrice);

    actionsWrapper.appendChild(ticketTypeWrapper);
    actionsWrapper.appendChild(ticketNumberWrapper);

    popup.appendChild(title);
    popup.appendChild(img);
    popup.appendChild(actionsWrapper);
    popup.appendChild(exitBtn);
    popup.appendChild(orderBtn);
    return popup;
};

function createTicketCategorySelection(ticketCategoryList) {
    const ticketTypeWrapper = document.createElement('div');
    ticketTypeWrapper.classList.add('ticket-type-wrapper');

    const selectOptions = ticketCategoryList.map(category => `<option value="${category.ticketCategoryID}">${category.ticketCategoryDescription}</option>`).join('');

    ticketTypeWrapper.innerHTML = `
        <select id="ticketType" class="ticket-type">
            ${selectOptions}
        </select>
    `;

    const priceLabel = document.createElement('label');
    priceLabel.id = "priceLabel";
    priceLabel.textContent = "N/A";

    ticketTypeWrapper.appendChild(priceLabel);

    const ticketTypeSelect = ticketTypeWrapper.querySelector(".ticket-type");
    if (ticketTypeSelect) {
        ticketTypeSelect.addEventListener("change", () => {
            selectedCategoryID = parseInt(ticketTypeSelect.value);
            updatePrice();
        });

        // Preselect the first option
        if (ticketTypeSelect.options.length > 0) {
            ticketTypeSelect.options[0].selected = true;
            selectedCategoryID = parseInt(ticketTypeSelect.value);
            updatePrice();
        }
    }
    function updatePrice() {
        const selectedCategory = ticketCategoryList.find(category => category.ticketCategoryID === selectedCategoryID);

        if (selectedCategory) {
            priceLabel.textContent = `Price: ${selectedCategory.ticketCategoryPrice}`;
        } else {
            priceLabel.textContent = "N/A";
        }
    }

    return ticketTypeWrapper;
}
function filterEventsByName(searchTerm) {
    const eventCards = document.querySelectorAll('.event-card');
    const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive search

    eventCards.forEach(eventCard => {
        const eventName = eventCard.querySelector('.eventName').textContent;

        if (searchRegex.test(eventName)) {
            eventCard.style.display = 'block'; // Show matching event cards
        } else {
            eventCard.style.display = 'none'; // Hide non-matching event cards
        }
    });
}