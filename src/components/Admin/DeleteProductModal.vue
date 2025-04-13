<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <h2 class="modal-title">Підтвердіть видалення</h2>
        <p>Ви впевнені, що хочете видалити товар "{{ product.name }}"?</p>
        <div class="modal-actions">
          <button class="modal-button cancel" @click="close">Скасувати</button>
          <button class="modal-button submit" @click="confirmDelete">Видалити</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    name: 'DeleteProductModal',
    props: {
      product: {
        type: Object,
        required: true
      }
    },
    methods: {
      confirmDelete() {
        axios
          .delete(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/products/${this.product.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          })
          .then(response => {
            this.$emit('product-deleted', this.product.id);
          })
          .catch(error => {
            console.error("Error deleting product", error);
          });
      },
      close() {
        this.$emit('close');
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  .modal-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 6px;
    width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    font-family: Montserrat, sans-serif;
    text-align: center;
  }
  .modal-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
  }
  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
  }
  .modal-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }
  .modal-button.cancel {
    background-color: #ccc;
    color: #000;
  }
  .modal-button.submit {
    background-color: #6b1f1f;
    color: #fff;
  }
  .modal-button.submit:hover {
    background-color: #a01212;
  }
  </style>
  