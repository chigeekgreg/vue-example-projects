app.component('order-modal', {
    template:
        /*html*/
        `<transition name="modal">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-container"> 
                <div class="modal-header">                 
                  <button class="modal-default-button" @click="$emit('close')">&#x2715;</button>
                  <h3>Order: {{ order.id }}, Status: {{order.status==='open'?'Authorized':'Shipped'}}</h3>
                </div>
                <div class="modal-body">
                  {{order.date.slice(0, 10)}}<br>
                  {{ order.name }},
                  {{ order.address }}<br>              
                  {{ order.email }} 
                  <h4>Order Items:</h4>
                  <div v-for="item in order.items">
                    {{item.quantity}} - {{item.part.description}}: \${{item.part.price}} - {{item.part.weight}}lbs<br>
                  </div>
                  <br>
                  Amount: \${{order.amount}}<br>
                  Shipping: \${{order.shipping}}<br>
                  Total: \${{(order.amount + order.shipping).toFixed(2)}}                                 
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