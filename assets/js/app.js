$(document).ready(function () {
    $('.money').mask('000.000.000.000.000,00', { reverse: true });
    $('.ui.dropdown').dropdown();

    // Variáveis globais
    var receitas = [];
    var despesas = [];


    // Configurar as credenciais do Firebase
    var firebaseConfig = {
        apiKey: "AIzaSyC1DegxDNN099jZjsnN2YBWZuE6u_gG16Y",
        authDomain: "fincontrol-3b9fa.firebaseapp.com",
        projectId: "fincontrol-3b9fa",
        storageBucket: "fincontrol-3b9fa.appspot.com",
        messagingSenderId: "521919064536",
        appId: "1:521919064536:web:f861260fd1031887ebeaad"
    };

    // Inicializar o Firebase
    firebase.initializeApp(firebaseConfig);

    // Verificar o estado de autenticação do usuário ao carregar a página
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Usuário está autenticado
            document.getElementById("openLoginModal").style.display = "none";
            document.getElementById("userContainer").style.display = "inline-block";
            document.getElementById("userName").textContent = "Olá, " + user.displayName + ' ';

            // Definir a imagem do usuário
            if (user.photoURL) {
                $('#openCreateUpdateModal').css("background-image", "url('" + user.photoURL + "')");
                $('#openCreateUpdateModal').css("background-size", "contain");
                $('#openCreateUpdateModal').find('i').toggleClass('user')

            }



            // Carregar os dados apenas se o usuário estiver logado
            carregarDados();
        } else {
            // Usuário não está autenticado
            document.getElementById("openLoginModal").style.display = "inline-block";
            document.getElementById("userContainer").style.display = "none";

        }
    });

    // Obter uma referência ao Firestore
    var db = firebase.firestore();



    /*
    * REAL TIME
    */

    // Referência para a coleção "receitas"
    var receitasRef = db.collection('contas').doc('dados').collection('receitas');

    // Listener em tempo real para a coleção "receitas"
    receitasRef.onSnapshot(function (snapshot) {
        if (verificarAutenticacao()) {
            snapshot.docChanges().forEach(function (change) {
                var receita = change.doc.data();
                if (change.type === 'added') {
                    receitas.push(receita);
                } else if (change.type === 'modified') {
                    var index = receitas.findIndex(function (item) {
                        return item.id === receita.id;
                    });
                    if (index !== -1) {
                        receitas[index] = receita;
                    }
                } else if (change.type === 'removed') {
                    var index = receitas.findIndex(function (item) {
                        return item.id === receita.id;
                    });
                    if (index !== -1) {
                        receitas.splice(index, 1);
                    }
                }
            });

            // Atualizar a UI com as receitas atualizadas
            renderReceitas();
        }
    });

    // Referência para a coleção "despesas"
    var despesasRef = db.collection('contas').doc('dados').collection('despesas');

    // Listener em tempo real para a coleção "despesas"
    despesasRef.onSnapshot(function (snapshot) {
        if (verificarAutenticacao) {
            snapshot.docChanges().forEach(function (change) {


                var despesa = change.doc.data();
                if (change.type === 'added') {
                    despesas.push(despesa);
                } else if (change.type === 'modified') {
                    var index = despesas.findIndex(function (item) {
                        return item.id === despesa.id;
                    });
                    if (index !== -1) {
                        despesas[index] = despesa;
                    }
                } else if (change.type === 'removed') {
                    var index = despesas.findIndex(function (item) {
                        return item.id === despesa.id;
                    });
                    if (index !== -1) {
                        despesas.splice(index, 1);
                    }
                }


            });
        }

        // Atualizar a UI com as despesas atualizadas
        renderDespesas();
    });
    /*
    * END REALTIME
    */


    // Abrir o modal de login ao clicar no botão
    $('#openLoginModal').on('click', function () {
        $('#loginModal').modal({
            blurring: true,
            closable: false,
            transition: 'scale',
        })
            .modal('show');
    });

    // Abrir o modal de atualização/ criação de usuario
    $('#openCreateUpdateModal').on('click', function () {
        console.log('click')
        // Chamada à função para preencher os dados ao abrir o modal
        $('#createUpdateModal').modal('show', function () {

            onShow: {
                console.log('onSHow')
                fillUserData();
            }
        });
    });



    function fillUserData() {
        var user = firebase.auth().currentUser;

        if (user) {
            var name = user.displayName;
            var email = user.email;

            // Preencher os campos de entrada com os dados do usuário
            document.getElementById('newNameInput').value = name;
            document.getElementById('newEmailInput').value = email;
        }
    }


    $('#createOrUpdateButton').on('click', function () {

        // Preencher os campos de entrada com os dados do usuário
        name = $('#newNameInput').val();
        email = $('#newEmailInput').val();
        pwd = $('#newPasswordInput').val();

        createOrUpdateUser(email, pwd, name);
    })
    $('#cancelButton').on('click', function () {
        $('#createUpdateModal').modal('hide');
    });
    // Função para criar uma conta com email e senha
    function createOrUpdateUser(email, senha, nome) {
        var user = firebase.auth().currentUser;

        // Verificar se a senha está em branco
        var isSenhaEmBranco = senha === "";

        // Verificar se o usuário já está autenticado
        if (user) {
            // Atualizar apenas o nome do usuário se a senha estiver em branco
            if (isSenhaEmBranco) {
                user.updateProfile({
                    displayName: nome
                })
                    .then(function () {
                        console.log("Nome do usuário atualizado com sucesso!");

                        // Fecha o modal
                        $('#createUpdateModal').modal('hide');
                    })
                    .catch(function (error) {
                        console.error("Erro ao atualizar o nome do usuário: ", error);
                    });
            } else {
                // Atualizar o email e senha do usuário
                user.updateEmail(email)
                    .then(function () {
                        // Atualizar apenas a senha do usuário
                        if (!isSenhaEmBranco) {
                            user.updatePassword(senha)
                                .then(function () {
                                    console.log("Email e senha do usuário atualizados com sucesso!");
                                    // Fecha o modal
                                    $('#createUpdateModal').modal('hide');
                                })
                                .catch(function (error) {
                                    console.error("Erro ao atualizar a senha do usuário: ", error);
                                });
                        }
                    })
                    .catch(function (error) {
                        console.error("Erro ao atualizar o email do usuário: ", error);
                    });
            }
        } else {
            // Criar uma conta com email e senha
            firebase.auth().createUserWithEmailAndPassword(email, senha)
                .then(function (userCredential) {
                    user = userCredential.user;

                    // Atualizar o nome do usuário no perfil do Firebase Authentication
                    user.updateProfile({
                        displayName: nome
                    })
                        .then(function () {
                            console.log("Usuário criado e nome atualizado com sucesso!");

                            // Salvar o nome do usuário no Firestore
                            db.collection('users').doc(user.uid).set({
                                name: nome,
                                email: user.email
                                // Outras informações do usuário que você deseja salvar
                            })
                                .then(function () {
                                    console.log("Nome do usuário salvo no Firestore com sucesso!");
                                })
                                .catch(function (error) {
                                    console.error("Erro ao salvar o nome do usuário no Firestore: ", error);
                                });

                            // Fecha o modal
                            $('#createUpdateModal').modal('hide');
                        })
                        .catch(function (error) {
                            console.error("Erro ao atualizar o nome do usuário: ", error);
                        });
                })
                .catch(function (error) {
                    console.error("Erro ao criar conta: ", error);
                });
        }
    }





    // Função para fazer login com email/senha
    function loginWithEmail(e) {
        e.preventDefault();
        var email = $('#emailInput').val();
        var password = $('#passwordInput').val();

        let loginSucesso = false;
        let errorMessage = $('#loginErrorMessage');


        // Defina o idioma para português (pt)
        //firebase.auth().useDeviceLanguage();
        // Autenticar com email/senha usando o Firebase Authentication
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function (userCredential) {
                // Login bem-sucedido, redirecionar ou executar ações adicionais
                console.log('Usuário logado:', userCredential.user);
                loginSucesso = true;

            })
            .catch(function (error) {
                // Tratar erros de login
                console.log(error.message);
                errorMessage.text(error.message);
                errorMessage.show();

            })
            .finally(function () {
                // Verificar o valor da variável loginSucesso antes de fechar o modal
                if (loginSucesso) {
                    $('#loginModal').modal('hide');
                }
            });
    }

    // Função para verificar se o email do usuário está cadastrado na base de dados
    // Função para verificar se o email do usuário já está cadastrado no Firebase
    function verificarEmailCadastrado(email) {
        // Verificar se o email já está cadastrado no Firebase
        firebase.auth().fetchSignInMethodsForEmail(email)
            .then((signInMethods) => {
                // Se a matriz de provedores de login for vazia, o email não está cadastrado
                if (signInMethods.length === 0) {
                    // Email não cadastrado, exibir mensagem de erro
                    $('#loginErrorMessage').text('Este email não está cadastrado. Por favor, faça o registro primeiro.');
                    $('#loginErrorMessage').show();
                    // Ou, se preferir, redirecionar o usuário para a página de registro
                    // window.location.href = '/registro'; // Substitua '/registro' pela URL da página de registro do seu aplicativo
                } else {
                    // Email cadastrado, permitir o login
                    $('#loginModal').modal('hide'); // Fechar o modal de login
                }
            })
            .catch((error) => {
                console.error('Erro ao verificar o email:', error);
                // Trate o erro de acordo com sua necessidade
                // Por exemplo, exiba uma mensagem de erro genérica ou redirecione o usuário para uma página de erro
            });
    }

    // Função para fazer login com a conta do Google
    function loginWithGoogle() {
        var provider = new firebase.auth.GoogleAuthProvider();



        let loginSucesso = false;
        let errorMessage = $('#loginErrorMessage');

        // Autenticar com a conta do Google usando o Firebase Authentication
        firebase
            .auth()
            .signInWithPopup(provider)
            .then(function (userCredential) {
                // Login bem-sucedido, redirecionar ou executar ações adicionais
                console.log('Usuário logado:', userCredential.user);

                // Verificar se o email do usuário está cadastrado na base de dados
                var userEmail = userCredential.user.email;
                verificarEmailCadastrado(userEmail);
                loginSucesso = true;
            })
            .catch(function (error) {
                // Tratar erros de login
                console.error('Erro ao fazer login com o Google:', error);

                errorMessage.text(error.message);
                errorMessage.show();
            })
            .finally(function () {
                if (loginSucesso) {
                    $('#loginModal').modal('hide');
                }
            });;
    }


    // Adicionar evento de clique para o botão de login com email/senha
    $('#emailLoginButton').on('click', loginWithEmail);

    // Adicionar evento de clique para o botão de login com Google
    $('#googleLoginButton').on('click', loginWithGoogle);
    // Função para fazer login com a conta do Google
    /* function loginWithGoogle() {
         var provider = new firebase.auth.GoogleAuthProvider();
         firebase.auth().signInWithPopup(provider)
             .then(function (result) {
                 // O usuário fez login com sucesso
                 var user = result.user;
                 console.log("Usuário logado:", user.displayName);
                 // Você pode redirecionar para outra página ou executar ações adicionais aqui
                 // Chamar as funções que exigem autenticação do usuário, se necessário
             })
             .catch(function (error) {
                 // Ocorreu um erro ao fazer login
                 console.error("Erro ao fazer login:", error);
             });
     }*/
    // Função para fazer logout do usuário
    function logout() {
        firebase.auth().signOut()
            .then(function () {
                // O usuário fez logout com sucesso
                console.log("Usuário deslogado");
                // Interromper a conexão com o Firestore
                //db.terminate();

                location.reload(); // Atualizar a página
                // Você pode redirecionar para a página de login ou executar outras ações necessárias
            })
            .catch(function (error) {
                // Ocorreu um erro ao fazer logout
                console.error("Erro ao fazer logout:", error);
            });
    }

    // Adicione um evento de clique ao botão de logout
    $("#logoutButton").on("click", function (e) {

        e.preventDefault();
        logout();
    });

    // Adicione um evento de clique ao botão de login com o Google
    $("#loginWithGoogleButton").on("click", loginWithGoogle);


    // Verificar se o usuário está autenticado
    function verificarAutenticacao() {
        var user = firebase.auth().currentUser;
        if (user) {
            // Usuário está autenticado
            console.log("Usuário autenticado. Ação permitida.");
            //carregarDados;
            return true;
        } else {
            // Usuário não está autenticado
            console.log("Usuário não autenticado. Ação não permitida.");
            return false;
        }
    }

    // Função para salvar os dados de receitas e despesas no Firestore
    function salvarDados() {
        if (verificarAutenticacao()) {
            db.collection('contas').doc('dados').set({
                receitas: receitas,
                despesas: despesas
            })
                .then(function () {
                    console.log("Dados salvos com sucesso!");
                })
                .catch(function (error) {
                    console.error("Erro ao salvar os dados: ", error);
                });
        } else {
            console.log("Usuário não autenticado. Ação não permitida.");
        }
    }

    // Função para carregar os dados de receitas e despesas do Firestore
    function carregarDados() {
        if (verificarAutenticacao()) {
            db.collection('contas').doc('dados').get()
                .then(function (doc) {
                    if (doc.exists) {
                        var data = doc.data();
                        receitas = data.receitas || [];
                        despesas = data.despesas || [];
                        renderReceitas();
                        renderDespesas();
                        calcularBalanco();
                    } else {
                        console.log("Nenhum documento encontrado. Usando dados vazios.");
                    }
                })
                .catch(function (error) {
                    console.error("Erro ao carregar os dados: ", error);
                });

            // Listener em tempo real para a coleção "contas/dados"
            db.collection('contas').doc('dados').onSnapshot(function (doc) {
                if (doc.exists) {
                    var data = doc.data();
                    receitas = data.receitas || [];
                    despesas = data.despesas || [];
                    renderReceitas();
                    renderDespesas();
                    calcularBalanco();
                } else {
                    console.log("Nenhum documento encontrado. Usando dados vazios.");
                }
            });
        } else {
            console.log("Usuário não autenticado. Ação não permitida.");
        }
    }


    // Função para exportar os dados para o Firestore
    function exportarParaFirestore() {
        db.collection('contas').doc('dados').set({
            receitas: receitas,
            despesas: despesas
        })
            .then(function () {
                console.log("Dados exportados para o Firestore com sucesso!");
            })
            .catch(function (error) {
                console.error("Erro ao exportar os dados para o Firestore: ", error);
            });
    }

    // Função para importar os dados do Firestore
    function importarDoFirestore() {
        db.collection('contas').doc('dados').get()
            .then(function (doc) {
                if (doc.exists) {
                    var data = doc.data();
                    receitas = data.receitas || [];
                    despesas = data.despesas || [];
                    renderReceitas();
                    renderDespesas();
                    calcularBalanco();
                    salvarDados();
                } else {
                    console.log("Nenhum documento encontrado para importação.");
                }
            })
            .catch(function (error) {
                console.error("Erro ao importar os dados do Firestore: ", error);
            });
    }


    /*
        // Função para carregar os dados de receitas e despesas do localStorage
        function carregarDados() {
            var receitasData = localStorage.getItem('receitas');
            if (receitasData) {
                receitas = JSON.parse(receitasData);
                renderReceitas();
            }
    
            var despesasData = localStorage.getItem('despesas');
            if (despesasData) {
                despesas = JSON.parse(despesasData);
                renderDespesas();
            }
            calcularBalanco(); // Calcular balanço após carregar os dados
        }
        // Função para salvar os dados de receitas e despesas no localStorage
        function salvarDados() {
            localStorage.setItem('receitas', JSON.stringify(receitas));
            localStorage.setItem('despesas', JSON.stringify(despesas));
        }
    */



    // Inicializar os modais com a opção closable: false
    $('.ui.modal').modal({ closable: true });

    // Carregar dados armazenados ao carregar a página
    carregarDados();


    // Adicionar Receita
    $('#add-receita').on('click', function () {
        $('#add-receita-modal').modal('show');
    });

    // Adicionar Despesa
    $('#add-despesa').on('click', function () {
        $('#add-despesa-modal').modal('show');
    });

    $('#add-despesa').popup();


    // Evento de submit para o formulário de Receita
    $('#form-receita').on('submit', function (e) {
        e.preventDefault(); // Evita que o formulário seja submetido normalmente

        var descricao = $('[name="modal-receita-descricao"]').val();
        var valor = $('[name="modal-receita-valor"]').val();

        if (descricao && valor) {
            var receita = {
                descricao: descricao,
                valor: formatMeasurement(valor.toString().replace(/\./g, "").replace(",", "."), 2),
            };

            receitas.push(receita);
            renderReceitas();
            calcularBalanco();
            $('#modal-receita-descricao').val('');
            $('#modal-receita-valor').val('');
            $('#add-receita-modal').modal('hide');
            // Limpar os campos do formulário
            $('#form-receita')[0].reset();

            calcularBalanco(); // Atualizar balanço após adicionar receita
            salvarDados(); // Salvar os dados após adicionar receita

        } else {
            alert('Preencha todos os campos!');
        }
    });

    // Evento de submit para o formulário de Despesa
    $('#form-despesa').on('submit', function (e) {
        e.preventDefault(); // Evita que o formulário seja submetido normalmente

        var descricao = $('[name="modal-despesa-descricao"]').val();
        var valor = $('[name="modal-despesa-valor"]').val();

        if (descricao && valor) {
            var despesa = {
                descricao: descricao,
                valor: formatMeasurement(valor.toString().replace(/\./g, "").replace(",", "."), 2),
            };

            despesas.push(despesa);
            renderDespesas();
            calcularBalanco();
            $('#modal-despesa-descricao').val('');
            $('#modal-despesa-valor').val('');
            $('#add-despesa-modal').modal('hide');
            // Limpar os campos do formulário
            $('#form-despesa')[0].reset();

            calcularBalanco(); // Atualizar balanço após adicionar despesa
            salvarDados(); // Salvar os dados após adicionar despesa
        } else {
            alert('Preencha todos os campos!');
        }
    });


    // Evento de clique para o botão "Cancelar" da modal de Receita
    $('#modal-cancel-receita').on('click', function () {
        $('#add-receita-modal').modal('hide');
    });

    // Evento de clique para o botão "Cancelar" da modal de Despesa
    $('#modal-cancel-despesa').on('click', function () {
        $('#add-despesa-modal').modal('hide');
    });



    // Renderizar Receitas
    function renderReceitas() {
        var receitasTable = $('#receitas-table tbody');
        receitasTable.empty();

        for (var i = 0; i < receitas.length; i++) {
            var receita = receitas[i];

            var row = '<tr>' +
                '<td class="four wide column">' + receita.descricao + '</td>' +
                '<td class="four wide column">' + receita.valor + '</td>' +
                '<td class="two wide column">' +
                '<button class="ui primary circular button editar-receita icon" data-index="' + i + '" data-content="Editar Despesa" data-position="top center"><i class="edit icon"></i></button>' +

                '<button class="ui negative circular mini button excluir-receita icon" data-index="' + i + '" data-content="Excluir Receita" data-position="top center"><i class="trash icon"></i></button>' +
                '</td>' +
                '</tr>';

            receitasTable.append(row);
        }

        // Ativar o componente de popup
        $('.excluir-receita').popup();
        // Adicionar evento de exclusão para os botões de excluir receita
        $('.excluir-receita').on('click', function () {
            var index = $(this).data('index');
            var despesa = receitas[index];

            // Exibir o modal de confirmação de exclusão
            $('#confirmDeleteModal')
                .modal({
                    blurring: true,
                    closable: false,
                    onApprove: function () {
                        // Confirmado, realizar a exclusão do item
                        receitas.splice(index, 1);
                        renderReceitas();
                        calcularBalanco();
                        // Salvar os dados após a exclusão da despesa
                        salvarDados();
                    },
                })
                .modal('show');
        }).popup({
            position: 'top center',
            content: 'Excluir Receita',
        });

        // Adicionar evento de edição para os botões de editar receita
        $('.editar-receita').on('click', function () {
            var index = $(this).data('index');
            var receita = receitas[index];

            // Preencher o modal com os dados da despesa
            $('#editDescriptionInput').val(receita.descricao);
            $('#editValueInput').val(receita.valor);

            // Abrir o modal de edição
            $('#editModal').modal('show');

            // Definir a ação do botão de salvar do modal de edição
            $('#saveEditButton').on('click', function () {
                var descricao = $('#editDescriptionInput').val();
                var valor = $('#editValueInput').val();

                // Atualizar os dados da despesa
                receita.descricao = descricao;
                receita.valor = formatMeasurement(valor.toString().replace(/\./g, "").replace(",", "."), 2);

                // Renderizar as despesas novamente
                renderReceitas();
                calcularBalanco();
                salvarDados();

                // Fechar o modal de edição
                $('#editModal').modal('hide');
            });

            // Definir a ação do botão de cancelar do modal de edição
            $('#cancelEditButton').on('click', function () {
                // Fechar o modal de edição sem salvar alterações
                $('#editModal').modal('hide');
            });
        });
    }

    // Inicializar a funcionalidade de arrastar e soltar para a tabela de despesas
    $("#despesas-table tbody").sortable({
        axis: "y",
        containment: "parent",
        cursor: "grabbing", // Define o cursor como "grabbing" ao arrastar
        update: function (event, ui) {
            // Obter a nova ordem das linhas
            var newOrder = $(this).find("tr").map(function () {
                return this.id;
            }).get();

            // Reordenar o array de despesas de acordo com a nova ordem
            var newDespesas = [];
            for (var i = 0; i < newOrder.length; i++) {
                var index = parseInt(newOrder[i].replace("despesa-", ""));
                newDespesas.push(despesas[index]);
            }
            despesas = newDespesas;

            // Renderizar a tabela de despesas com a nova ordem
            renderDespesas();

            console.log('renderizado');
            // Salvar os dados após a reordenação
            salvarDados(); // Verifique se a função está sendo chamada corretamente aqui

            console.log('salvo')
        }
    }).disableSelection(); // Impede a seleção de texto ao arrastar



    // Renderizar Despesas
    function renderDespesas() {
        var despesasTable = $('#despesas-table tbody');
        despesasTable.empty();

        for (var i = 0; i < despesas.length; i++) {
            var despesa = despesas[i];

            var row = '<tr id="despesa-' + i + '" class="drag-handle">' +
                '<td class="four wide column">' + capitalizeDescription(despesa.descricao) + '</td>' +
                '<td class="four wide column">' + despesa.valor + '</td>' +
                '<td class="two wide column">' +
                '<div class="ui toggle checkbox">' +
                '<input type="checkbox" class="pago-checkbox" data-index="' + i + '" data-content="Marcar como pago" data-position="top center" ' + (despesa.pago ? 'checked' : '') + '>' +
                '<label></label>' +
                '</div>' +
                '</td>' +
                '<td class="two wide column">' +
                '<button class="ui primary circular button editar-despesa icon" data-index="' + i + '" data-content="Editar Despesa" data-position="top center"><i class="edit icon"></i></button>' +
                '<button class="ui negative circular mini button excluir-despesa icon" data-index="' + i + '" data-content="Excluir Despesa" data-position="top center"><i class="trash icon"></i></button>' +
                '</td>' +
                '</tr>';

            despesasTable.append(row);
        }

        $('.pago-checkbox').on('click', function () {
            var index = $(this).data('index');
            despesas[index].pago = $(this).is(':checked');
            calcularBalanco();
            salvarDados();
        });

        // Ativar o componente de popup
        $('.excluir-despesa, .editar-despesa').popup();


        // Adicionar evento de exclusão para os botões de excluir despesa
        $('.excluir-despesa').on('click', function () {
            var index = $(this).data('index');
            var despesa = despesas[index];

            // Exibir o modal de confirmação de exclusão
            $('#confirmDeleteModal')
                .modal({
                    blurring: true,
                    closable: false,
                    onApprove: function () {
                        // Confirmado, realizar a exclusão do item
                        despesas.splice(index, 1);
                        renderDespesas();
                        calcularBalanco();
                        // Salvar os dados após a exclusão da despesa
                        salvarDados();
                    },
                })
                .modal('show');
        });


        // Adicionar evento de edição para os botões de editar despesa
        $('.editar-despesa').on('click', function () {
            var index = $(this).data('index');
            var despesa = despesas[index];

            // Preencher o modal com os dados da despesa
            $('#editDescriptionInput').val(despesa.descricao);
            $('#editValueInput').val(despesa.valor);

            // Abrir o modal de edição
            $('#editModal').modal('show');

            // Definir a ação do botão de salvar do modal de edição
            $('#saveEditButton').on('click', function () {
                var descricao = $('#editDescriptionInput').val();
                var valor = $('#editValueInput').val();

                // Atualizar os dados da despesa
                despesa.descricao = descricao;
                despesa.valor = formatMeasurement(valor.toString().replace(/\./g, "").replace(",", "."), 2);

                // Renderizar as despesas novamente
                renderDespesas();
                calcularBalanco();
                salvarDados();

                // Fechar o modal de edição
                $('#editModal').modal('hide');
            });

            // Definir a ação do botão de cancelar do modal de edição
            $('#cancelEditButton').on('click', function () {
                // Fechar o modal de edição sem salvar alterações
                $('#editModal').modal('hide');
            });
        });
    }


    // Evento de clique para o botão "Limpar Dados"
    $('#limpar-dados').on('click', function () {
        // Limpar as arrays de receitas e despesas
        receitas = [];
        despesas = [];

        // Renderizar as tabelas vazias
        renderReceitas();
        renderDespesas();

        // Recalcular o balanço e salvar os dados vazios
        calcularBalanco();
        salvarDados();

        localStorage.clear();

    });


    // Função para calcular a soma das receitas
    function calcularSomaReceitas() {
        var somaReceitas = 0;
        for (var i = 0; i < receitas.length; i++) {
            var valor = parseFloat(receitas[i].valor.replace(/\./g, "").replace(",", "."));
            somaReceitas += valor;
        }
        return somaReceitas;
    }

    // Função para calcular a soma das despesas
    function calcularSomaDespesas() {
        var somaDespesas = 0;
        for (var i = 0; i < despesas.length; i++) {
            var valor = parseFloat(despesas[i].valor.replace(/\./g, "").replace(",", "."));
            somaDespesas += valor;
        }
        return somaDespesas;
    }

    // Calcular Balanço
    function calcularBalanco() {
        var totalReceitas = 0;
        for (var i = 0; i < receitas.length; i++) {
            totalReceitas += parseFloat(receitas[i].valor.replace(/\./g, "").replace(",", "."));
        }

        var totalDespesas = 0;
        for (var i = 0; i < despesas.length; i++) {
            totalDespesas += parseFloat(despesas[i].valor.replace(/\./g, "").replace(",", "."));
        }

        var balanco = totalReceitas - totalDespesas;
        var balancoElement = $('#balanco');

        var totalDespesasPagas = 0;
        var totalDespesasNaoPagas = 0;
        for (var i = 0; i < despesas.length; i++) {
            if (despesas[i].pago) {
                totalDespesasPagas += parseFloat(despesas[i].valor.replace(/\./g, "").replace(",", "."));
            } else {
                totalDespesasNaoPagas += parseFloat(despesas[i].valor.replace(/\./g, "").replace(",", "."));
            }
        }



        // balancoElement.text(formatCurrency(balanco));

        var balanco = totalReceitas - totalDespesasPagas;
        var spanBalanco = balancoElement.parent().find('span');
        if (balanco >= 0) {

            spanBalanco.removeClass('red').addClass('green');

            //balancoElement.removeClass('red');
            //balancoElement.addClass('green');
        } else {
            spanBalanco.removeClass('green').addClass('red');
            //balancoElement.removeClass('green');
            //balancoElement.addClass('red');
        }


        balancoElement.text(formatCurrency(balanco));


        var somaReceitas = totalReceitas;
        var somaDespesas = totalDespesas;
        var somaDespesasPagas = totalDespesasPagas;
        var somaDespesasNaoPagas = totalDespesasNaoPagas;


        // Atualizar as somas das receitas e despesas
        $('#soma-receitas').text(formatCurrency(somaReceitas));
        $('#soma-despesas').text(formatCurrency(somaDespesas));


        $('#soma-despesas-pagas').text(formatCurrency(somaDespesasPagas));
        $('#soma-despesas-nao-pagas').text(formatCurrency(somaDespesasNaoPagas));

    }

    // Formatar valor monetário
    function formatCurrency(value) {
        var formattedValue = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return formattedValue;
    }

    // Função para capitalizar a descrição
    function capitalizeDescription(description) {
        return description.charAt(0).toUpperCase() + description.slice(1);
    }

    // Função para exportar o conteúdo para PDF
    function exportarParaPDF() {
        // Cria um novo documento PDF
        var doc = new jspdf.jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
            left: 20,
            right: 20,
            top: 60,
            bottom: 60
        });

        doc.setFont('helvetica');

        // Armazenar a data de geração do arquivo
        var dataGeracao = moment().format('DD/MM/YYYY HH:mm:ss');

        // Adiciona as tabelas ao documento PDF
        var receitasTable = $('#receitas-table');
        var despesasTable = $('#despesas-table');
        var balanco = $('#balanco');


        // Adiciona os valores
        var somaReceitas = $('#soma-receitas');
        var somaDespesas = $('#soma-despesas');


        var somaDespesasPagas = $('#soma-despesas-pagas');
        var somaDespesasNaoPagas = $('#soma-despesas-nao-pagas');



        // Definir a posição inicial da primeira tabela
        var startY = 40;

        // Adiciona a tabela de receitas ao documento PDF
        addTableToPDF(doc, receitasTable, 'Receitas', startY);

        // Atualizar a posição inicial startY para a próxima tabela
        startY = doc.autoTable.previous.finalY + 20;

        // Adiciona a tabela de despesas ao documento PDF
        addTableToPDF(doc, despesasTable, 'Despesas', startY);

        console.log('1', doc.autoTable.previous.finalY);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        // Adicionar título da tabela alinhado à direita
        let textWidth = 'Pagas ' + somaDespesasPagas.text();

        doc.text( 'Pagas ', doc.internal.pageSize.getWidth() - doc.getTextWidth(textWidth), doc.lastAutoTable.finalY + 10, { align: 'right' });
        doc.setFont(undefined, 'bold');
        doc.text('R$ ' + somaDespesasPagas.text(), doc.internal.pageSize.getWidth() - 15, doc.lastAutoTable.finalY + 10, { align: 'right' });

        console.log('2', doc.autoTable.previous.finalY);

        doc.setFont(undefined, 'normal');

        textWidth = 'Não Pagas ' + somaDespesasNaoPagas.text()
        doc.text('Não Pagas ', doc.internal.pageSize.getWidth() - doc.getTextWidth(textWidth), doc.lastAutoTable.finalY + 15, { align: 'right' });
        
        doc.setFont(undefined, 'bold');
        doc.text('R$ ' + somaDespesasNaoPagas.text(), doc.internal.pageSize.getWidth() - 15, doc.lastAutoTable.finalY + 15, { align: 'right' });

        console.log('3 ', doc.autoTable.previous.finalY);

        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Balanço R$ ' + balanco.text(), doc.internal.pageSize.getWidth() - 15, doc.lastAutoTable.finalY + 20, { align: 'right' });

        console.log('final', doc.autoTable.previous.finalY);

        // Adicionar a imagem centralizada no cabeçalho da primeira página
        var imgURL = './assets/img/logo.png'; // Ajuste o caminho da imagem conforme necessário
        var imgWidth = 50; // Largura da imagem em mm
        var headerX = doc.internal.pageSize.getWidth() / 2 - imgWidth / 2; // Posição X para centralizar a imagem
        //var headerX = 15; // Posição X para centralizar a imagem
        var headerY = 5; // Posição Y para ajustar a altura da imagem

        // Função para converter a URL da imagem em data URL
        function toDataURL(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                var reader = new FileReader();
                reader.onloadend = function () {
                    callback(reader.result);
                };
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.send();
        }

        // Carregar a imagem usando a função toDataURL
        toDataURL(imgURL, function (dataURL) {
            // Carregamento da imagem concluído, continuar com o processamento do PDF
            // Add the image to the PDF
            var img = new Image();
            img.onload = function () {
                var aspectRatio = img.width / img.height;
                var imgHeight = imgWidth / aspectRatio; // Calcula a altura proporcional com base na largura desejada


                // Adicionar número de página no rodapé e cabeçalho
                var pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFont(undefined, 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Página ' + i.toString() + ' de ' + pageCount.toString(), doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

                    // Adicionar cabeçalho na primeira página
                    if (i === 1) {
                        doc.addImage(dataURL, 'PNG', headerX, headerY, imgWidth, imgHeight);
                    }

                    // Adicionar data de geração do arquivo no canto
                    doc.setFont(undefined, 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Gerado em: ' + dataGeracao, doc.internal.pageSize.getWidth() - 15, 10, { align: 'right' });
                }

                // Formatar a data no formato "DD-MM-YYYY"
                var dataArquivo = moment().format('DD-MM-YYYY');

                // Concatenar a data formatada ao nome do arquivo
                var nomeArquivo = 'balanco_' + dataArquivo + '.pdf';

                // Salvar o arquivo PDF com o nome contendo a data atual
                doc.save(nomeArquivo);
            };
            img.src = imgURL;
        }, null, { crossOrigin: true });
    }



    // Função auxiliar para adicionar uma tabela ao documento PDF
    function addTableToPDF(doc, table, title, startY = 30, showTitle = true) {
        // Clona a tabela original para não modificar a tabela na página
        var clonedTable = table.clone();

        // Verifica se a tabela é a tabela "QtdeMateriais" ou a primeira tabela
        var isFirstTable = clonedTable.is(':first-child');
        var isReceitasTable = clonedTable.find('th:first-child').text().trim() === 'Descrição' &&
            clonedTable.find('th:nth-child(2)').text().trim() === 'Valor' &&
            clonedTable.find('th:nth-child(3)').text().trim() === 'Ação';

        if (isReceitasTable && isFirstTable) {
            // Remove a coluna "Ação" da tabela clonada
            clonedTable.find('th:nth-child(3), td:nth-child(3)').remove();
        }

        // Verifica se a tabela é a tabela "PesoMateriais"
        var isDespesasTable = clonedTable.find('th:first-child').text().trim() === 'Descrição' &&
            clonedTable.find('th:nth-child(2)').text().trim() === 'Valor' &&
            clonedTable.find('th:nth-child(3)').text().trim() === 'Pago';

        if (isDespesasTable) {
            // Remove a coluna "Ação" da tabela clonada
            clonedTable.find('th:nth-child(4), td:nth-child(4)').remove();
        }
        if (showTitle) {
            // Centralizar o texto horizontalmente
            var titleWidth = doc.getTextWidth(title); // Calcular a largura do texto
            var titleXOffset = titleWidth / 2; // Deslocamento necessário para centralizar

            // Declare titleX here
            var titleX = doc.internal.pageSize.getWidth() / 2; // Posição X centralizada

            // Ajustar a posição Y do título com base na tabela anterior ou no topo da página
            var titleY = startY - 10; // Espaçamento entre a tabela anterior e o título

            // Adiciona o título ao documento PDF
            doc.setFont(undefined, 'bold')
            doc.setFontSize(14);

            doc.setTextColor(0, 0, 0);
            doc.text(title, titleX - titleXOffset, titleY);
        }



        // Mapear o cabeçalho da tabela clonada
        var headers = [];
        clonedTable.find('th').each(function () {
            headers.push($(this).text().trim());
        });

        // Mapear os dados da tabela clonada
        var data = [];
        clonedTable.find('tbody tr').each(function () {
            var row = [];
            $(this).find('td').each(function (index) {
                var cellText = $(this).text().trim();
                if (isDespesasTable && index === 2) {
                    // Obter o valor do checkbox
                    var isChecked = $(this).find('input[type="checkbox"]').is(':checked');
                    // Converter valor em Sim ou Não
                    cellText = isChecked ? 'Sim' : 'Não';
                }
                row.push(cellText);
            });
            data.push(row);
        });



        // Configurar as opções da tabela
        var tableOptions = {
            startY: startY, // Usar a posição inicial recebida como parâmetro
            headStyles: {
                fillColor: [240, 240, 240], // Define a cor do cabeçalho como whitesmoke
                textColor: [0, 0, 0]
            },
            head: [headers],
            body: data
        };

        // Adiciona a tabela clonada ao documento PDF
        doc.autoTable(tableOptions);


    }


    // Vincula o evento de clique ao botão "Exportar para PDF"
    $('#exportar-pdf').on('click', exportarParaPDF);

    // Formatar valor monetário e retornar como número
    function formatCurrencyAsNumber(value, decimalPlaces = 2) {
        // Converte o valor para string e remove possíveis símbolos de moeda
        let stringValue = String(value).replace(/[^0-9.-]+/g, '');

        // Converte o valor formatado de volta para um número
        let numericValue = parseFloat(stringValue);

        // Formata o valor monetário adicionando as casas decimais
        let formattedValue = numericValue.toFixed(decimalPlaces);

        return formattedValue;
    }

    function formatMeasurement(value, decimalPlaces = 3) {
        // Converte o valor para número, se possível
        let numericValue = parseFloat(value);

        // Verifica se o valor é um número válido
        if (!isNaN(numericValue)) {
            // Aplica o método toFixed() para limitar as casas decimais
            let fixedValue = numericValue.toFixed(decimalPlaces);

            // Converte o valor para string
            let stringValue = String(fixedValue);

            // Divide o valor em parte inteira e decimal
            let parts = stringValue.split('.');
            let integerPart = parts[0];
            let decimalPart = parts[1] || '';

            // Adiciona o separador de milhares à parte inteira
            let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

            // Adiciona zeros à direita se necessário
            let formattedDecimalPart = decimalPart.padEnd(decimalPlaces, '0');

            // Formata o número de medida adicionando o separador decimal e as casas decimais
            return formattedIntegerPart + (decimalPlaces > 0 ? ',' + formattedDecimalPart : '');
        } else {
            // Se não for um número válido, retorne uma string vazia
            return '';
        }
    }


    // Função para exportar dados para Excel
    // Função para exportar dados para Excel
    function exportarParaExcel() {
        var wb = XLSX.utils.book_new();

        // Cabeçalhos
        var cabecalhos = ["Receitas", "Valor", "Despesas", "Valor", "Pago"];

        // Dados das receitas e despesas
        var dados = [];
        dados.push(cabecalhos); // Adiciona os cabeçalhos como a primeira linha
        var maxLinhas = Math.max(receitas.length, despesas.length);
        for (var i = 0; i < maxLinhas; i++) {
            var receita = receitas[i] || {};
            var despesa = despesas[i] || {};
            // Formata os valores monetários antes de adicioná-los ao array

            // Formata os valores monetários antes de adicioná-los ao array
            let valorReceita = parseFloat(receita.valor?.replace(/\./g, "").replace(",", ".")) || ''; //se no lopo nao estiver valores monetarios a serem formatados deixa vazio
            let valorDespesa = parseFloat(despesa.valor?.replace(/\./g, "").replace(",", ".")) || '';
            var pagoDespesa = despesa.pago ? "Sim" : "Não";
            dados.push([receita.descricao, valorReceita, despesa.descricao, valorDespesa, pagoDespesa]);
        }
        let balancoVal = parseFloat($('#balanco').text().replace(/\./g, "").replace(",", "."));
        // Dados do balanço
        var balancoData = [[""], [""], ["Balanço: R$", formatMeasurement(balancoVal, 2)]];

        var dadosSheet = XLSX.utils.aoa_to_sheet(dados.concat(balancoData));
        XLSX.utils.book_append_sheet(wb, dadosSheet, "Dados");

        // Formatar a data no formato "DD-MM-YYYY"
        var dataArquivo = moment().format('DD-MM-YYYY');

        // Concatenar a data formatada ao nome do arquivo
        var nomeArquivo = 'balanco_' + dataArquivo + '.xlsx';

        // Salvar o arquivo XLSX com o nome contendo a data atual
        XLSX.writeFile(wb, nomeArquivo);
    }


    // Vincula o evento de clique ao botão "Exportar para Excel"
    $('#exportar-excel').on('click', exportarParaExcel);

    // Função para importar dados do Excel
    // Função para importar dados do Excel
    // Função para importar dados do Excel
    function importarDoExcel(event) {
        console.log('Função importarDoExcel foi chamada.');
        var files = event.target.files;
        if (files && files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                console.log('Arquivo lido com sucesso.', e);
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });

                console.log('Objeto workbook:', workbook);

                // Importa os dados da planilha "Dados" sem os cabeçalhos
                var dadosSheet = workbook.Sheets["Dados"];
                var dadosData = XLSX.utils.sheet_to_json(dadosSheet, { header: 1 });
                console.log('Dados da planilha:', dadosData);

                // Importa os dados das receitas
                receitas = [];
                for (var i = 1; i < dadosData.length; i++) {
                    var row = dadosData[i];
                    if (row[0]) {
                        if (row[0] != "Balanço: R$") {
                            receitas.push({
                                descricao: row[0],
                                valor: formatMeasurement(row[1], 2),
                            });
                        }
                    }
                }

                console.log('Receitas após a importação:', receitas);

                // Importa os dados das despesas
                despesas = [];
                for (var i = 1; i < dadosData.length; i++) {
                    var row = dadosData[i];
                    if (row[2]) {
                        despesas.push({
                            descricao: row[2],
                            valor: formatMeasurement(parseFloat(row[3]), 2),
                            pago: row[4] === "Sim"
                        });
                    }
                }

                console.log('Despesas após a importação:', despesas);

                // Atualiza a renderização e o balanço
                renderReceitas();
                renderDespesas();
                calcularBalanco();
                salvarDados();
            };
            reader.readAsArrayBuffer(files[0]);

            // Limpar o campo de input de arquivo
            $('#importar-excel').val('');
        }
    }

    // Vincula o evento de mudança de arquivo ao input de importação
    $('#importar-excel').on('change', importarDoExcel);


    // Vincula o evento de mudança de arquivo ao input de importação
    $('#importar-excel').on('change', importarDoExcel);

    // Configurar a funcionalidade de classificação dos itens de sliders
    $("#despesas-table").sortable({
        cursor: "move",
        opacity: 0.5,
        axis: "y",
        items: "tbody tr"
    }).disableSelection();

});
