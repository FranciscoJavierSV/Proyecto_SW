const form = document.getElementById('updateForm');
const btnUpdate = document.getElementById('btnUpdate');
const inputs = form.querySelectorAll('input[required], textarea[required]');
        const imagenInput = document.getElementById('imagen');
        const imagePreview = document.getElementById('imagePreview');

        function selectProduct(nombre, imagen, descripcion, precio, stock) {
            document.getElementById('nombre').value = nombre;
            document.getElementById('descripcion').value = descripcion;
            document.getElementById('precio').value = precio;
            document.getElementById('stock').value = stock;
            imagenInput.value = '';
            imagePreview.innerHTML = '';
            checkFormValidity();
        }

        imagenInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Vista previa">`;
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '';
            }
            checkFormValidity();
        });

        function checkFormValidity() {
            let allFilled = true;
            
            const nombre = document.getElementById('nombre').value.trim();
            const descripcion = document.getElementById('descripcion').value.trim();
            const precio = document.getElementById('precio').value.trim();
            const stock = document.getElementById('stock').value.trim();
            const imagen = imagenInput.files.length > 0;

            if (!nombre || !descripcion || !precio || !stock || !imagen) {
                allFilled = false;
            }

            btnUpdate.disabled = !allFilled;
        }

        document.getElementById('nombre').addEventListener('input', checkFormValidity);
        document.getElementById('descripcion').addEventListener('input', checkFormValidity);
        document.getElementById('precio').addEventListener('input', checkFormValidity);
        document.getElementById('stock').addEventListener('input', checkFormValidity);

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Producto actualizado correctamente');
        });