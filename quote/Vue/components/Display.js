app.component('display', {
    template:
        /*html*/
        `<div class="display"> 
          <input v-model="search" placeholder="query"> Filter by Part Description    
          <div v-if="search!= ''">List of parts that match your query:</div>
          <div v-else>All parts (enter search criteria above to filter results)</div>
          <div :set="count = 0">
           <div v-for="part in list">
            <div v-if="part.description.toLowerCase().includes(search.toLowerCase())" :set="count++">
                <product :part="part" :type="'ordering'" @add-to-Cart="addToCart"></product>               
            </div>
           </div>
          </div>
          <h3>{{ count }} parts found</h3>
         </div>`,
    data() {
        return {
            parts: null,
            search: ''
        }
    },
    methods: {
        async getParts() {
            var resp = await axios.get('http://localhost:3000/getParts')
            // console.log(resp.data);
            this.parts = resp.data
        },
        async addToCart(part) { 
            this.$emit('add-to-cart', part)          
            // console.log(part)
        }
    },
    computed: {
        list() {
            if (this.parts == null) {
                this.getParts()
            } 
            return this.parts
        }
    }
})