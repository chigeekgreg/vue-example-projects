app.component('checkout-modal', {
    template:
        /*html*/
        `<transition name="modal">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-container"> 
                <div class="modal-header">
                  <h3>Confirmation: {{ order.msg }}</h3>
                </div> 
                <div class="modal-body">
                  Amount: {{ (order.amount + order.shipping).toFixed(2) }}
                  Auth: {{ order.auth }}<br>
                  For: {{ order.name }}, {{ order.email }}                 
                </div>      
                <div class="modal-footer">
                  Thank you for shopping with us.
                  <button class="modal-default-button" @click="$emit('close')">OK</button>
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