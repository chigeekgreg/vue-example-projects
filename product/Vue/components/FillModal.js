app.component('fill-modal', {
    template:
        /*html*/
        `<transition name="modal">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-container"> 
                <div class="modal-header">                 
                  <button class="modal-default-button" @click="$emit('cancel')">&#x2715;</button>
                  <h3>Order Filling: {{ order.id }}</h3>
                </div>
                <div class="modal-body">
                  <h4>Packing List:</h4>
                  <div v-for="item in order.items">
                    #{{item.partnumber}} {{item.description}} x {{item.quantity}}<br>
                  </div>
                  <h4>Invoice:</h4>
                  <div v-for="item in order.items">
                    {{item.quantity}} - {{item.description}}: {{item.price}}<br>
                  </div>
                  Amount: {{order.amount}}<br>
                  Shipping: {{order.shipping}}<br>
                  Total: {{(order.amount + order.shipping).toFixed(2)}}<br>
                  <h4>Shipping Label:</h4>
                  {{ order.name }}<br>
                  {{ order.address }} <br>                
                  order confirmation sent to: {{ order.email }}                 
                </div>      
                <div class="modal-footer">
                  Order will be marked as fullfilled.
                  <button class="modal-default-button" @click="$emit('close')">Done</button>
                </div>
              </div>
            </div>
        </div>
      </transition>`,
    props: {
        order: {
            type: Object,
            required: true
        }
    },
})