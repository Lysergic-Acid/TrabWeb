$(document).ready(function(){
    var serverURL = 'http://localhost:3000/emcartaz';
    var $tcorpo = $("#tcorpo");
    var $modalAdicionar = $("#modalAdicionar");
    var $modalAlterar = $("#modalAlterar");
    var $formAlterar = $("#formAlterar");
    var linhaID; // Tem que ser global se não buga tudo essa merda

    function addCartaz(emcartaz, nomeFilme){
        $tcorpo.append("<tr><th scope='row'>" + emcartaz.id + "</th><td class='sala_id'>" + emcartaz.sala_id + "</td><td class='filme_id'>"
        + emcartaz.filme_id + "</td><td class='nomeFilme'>" + nomeFilme + "</td><td class='horario'>" + emcartaz.horario + 
        "</td><td class='ativo'>" + emcartaz.ativo + "</td><td><button type='button' class='editarIdFilme btn btn-warning' data-id='"+ emcartaz.id +
        "'>Alterar dados</button></td><td><button type='button' class='apagar btn btn-danger' data-id='" + emcartaz.id + "'>Apagar</button></td></tr>");
    }
    
    // CARREGAR 
    $.ajax({
        type: 'GET',
        url: serverURL,
        success: function(data){
            $.each(data, function(i,emcartaz){
                $.ajax({
                    type: 'GET',
                    url: 'http://localhost:3000/filmes/' + emcartaz.filme_id,
                    success: function(dataFilme){
                        var nomeFilme = dataFilme.titulo;
                        addCartaz(emcartaz, nomeFilme);
                    },
                    error: function() {
                        //alert("Erro ao carregar o filme com ID: " + emcartaz.filme_id);
                        var nomeFilme = "Não existente";
                        addCartaz(emcartaz, nomeFilme);
                    },
                });
            })
        },
    });

    // APAGAR
    $tcorpo.delegate(".apagar","click",function(){
        var $tr = $(this).closest("tr");
        if(confirm("Você realmente deseja deletar esse filme em cartaz?")){
            $.ajax({
                type: 'DELETE',
                url: serverURL + "/" + $(this).attr("data-id"),
                success: function(){
                    alert("Filme removido com sucesso");
                    $tr.fadeOut(300, function(){
                        $(this).remove();
                    });
                }
            });
        }
    });

    // EDITAR
    $tcorpo.delegate(".editarIdFilme","click",function(){
        var linha = this.parentNode.parentNode;
        linhaID = linha.firstChild.textContent;
        $modalAlterar.modal('show');
        
        $formAlterar.on('submit', function(form){
            form.preventDefault();
            form.stopImmediatePropagation();
            var editIdFilme = document.querySelector("#inputEditIdFilme");
        
            if (editIdFilme.value == '' || editIdFilme.value == null) {
                editIdFilme.classList.add('border-danger');
                return;
            } else {
                var filme = {
                    filme_id: editIdFilme.value,
                    sala_id: linha.querySelector('.sala_id').textContent,
                    horario: linha.querySelector('.horario').textContent,
                    ativo: linha.querySelector('.ativo').textContent,
                };
                $.ajax({
                    url: serverURL + "/" + linhaID,
                    type: 'PUT',    
                    data: filme,
                    success: function(response) {
                        $.ajax({
                            type: 'GET',
                            url: 'http://localhost:3000/filmes/' + editIdFilme.value,
                            success: function(dataFilme){
                                alert("Filme alterado com sucesso");
                                linha.querySelector('.filme_id').textContent = editIdFilme.value;
                                linha.querySelector('.nomeFilme').textContent = dataFilme.titulo;
                                editIdFilme.classList.remove('border-danger');
                                editIdFilme.value = '';
                                $modalAlterar.modal('hide');
                            },
                            error: function() {
                                //alert("Erro ao carregar o filme com ID: " + emcartaz.filme_id);
                                linha.querySelector('.filme_id').textContent = editIdFilme.value;
                                linha.querySelector('.nomeFilme').textContent = "Não existente";
                                editIdFilme.classList.remove('border-danger');
                                editIdFilme.value = '';
                                $modalAlterar.modal('hide');
                            },
                        });
                    }
                });
            }
        }); 
    });
   
    // ADICIONAR
    $modalAdicionar.delegate(".adicionar","click",function(){
        var addSala = document.querySelector("#inputAddSala");
        var addIdFilme = document.querySelector("#inputAddIdFilme");
        var addHorario = document.querySelector("#inputAddHorario");
        var erro = false;

        if (addSala.value == '' || addSala.value == null) {
            addSala.classList.add('border-danger');
            erro = true;
        } else {
            addSala.classList.remove('border-danger');
            addSala.classList.add('border-success');
        }
        if (addIdFilme.value == '' || addIdFilme.value == null) {
            addIdFilme.classList.add('border-danger');
            erro = true;
        } else {
            addIdFilme.classList.remove('border-danger');
            addIdFilme.classList.add('border-success');
        }
        if (addHorario.value == '' || addHorario.value == null) {
            addHorario.classList.add('border-danger');
            erro = true;
        } else {
            addHorario.classList.remove('border-danger');
            addHorario.classList.add('border-success');
        }
        if(erro){
            return;
        }
        else{
            var filme = {
                sala_id: addSala.value,
                filme_id: addIdFilme.value,
                horario: addHorario.value,
                ativo: "Não",
            };
            addSala.classList.remove('border-success');
            addIdFilme.classList.remove('border-success');
            addHorario.classList.remove('border-success');
            $.ajax({
                type: 'POST',
                url: serverURL,
                data: filme,
                success: function(adicionar){
                    $("#modalAdicionar").modal('hide');
                    addCartaz(adicionar);
                    alert("Filme adicionado com sucesso");  
                    addSala.value = '';
                    addIdFilme.value = '';
                    addHorario.value = '';
                }
            });
        }
    });

    //SAIR
    $('#sair').click(function(){
        if(confirm("Você realmente deseja sair?")){
            $(location).attr('href', '../login/login.html');
        }
    })
});