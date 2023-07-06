$(document).ready(function () {
    $('.money').mask('000.000.000.000.000,00', { reverse: true });
    $('.ui.dropdown').dropdown();

    // Variáveis globais
    var receitas = [];
    var despesas = [];

    // Função para salvar os dados de receitas e despesas no localStorage
    function salvarDados() {
        localStorage.setItem('receitas', JSON.stringify(receitas));
        localStorage.setItem('despesas', JSON.stringify(despesas));
    }


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

    // Inicializar os modais com a opção closable: false
    $('#add-receita-modal').modal({ closable: false });
    $('#add-despesa-modal').modal({ closable: false });

    // Carregar dados armazenados ao carregar a página
    carregarDados();



    // Inicializar os modais com a opção closable: false
    $('#add-receita-modal').modal({ closable: false });
    $('#add-despesa-modal').modal({ closable: false });


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
                valor: valor
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
                valor: valor
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
                '<td class="two wide column"><button class="ui negative button excluir-receita" data-index="' + i + '" data-content="Excluir Receita" data-position="top center"><i class="trash icon"></i></button></td>' +
                '</tr>';

            receitasTable.append(row);
        }

        // Ativar o componente de popup
        $('.excluir-receita').popup();
        // Adicionar evento de exclusão para os botões de excluir receita
        $('.excluir-receita').on('click', function () {
            var index = $(this).data('index');
            receitas.splice(index, 1);
            renderReceitas();
            calcularBalanco();
            // Salvar os dados após adicionar receita
            salvarDados();
        }).popup({
            position: 'top center',
            content: 'Excluir Receita',
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
                '<td class="two wide column"><button class="ui negative button excluir-despesa" data-index="' + i + '" data-content="Excluir Despesa" data-position="top center"><i class="trash icon"></i></button></td>' +
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
        $('.excluir-despesa').popup();

        // Adicionar evento de exclusão para os botões de excluir despesa
        $('.excluir-despesa').on('click', function () {
            var index = $(this).data('index');
            despesas.splice(index, 1);
            renderDespesas();
            calcularBalanco();
            // Salvar os dados após adicionar receita
            salvarDados();
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
        if (balanco >= 0) {
            balancoElement.removeClass('red');
            balancoElement.addClass('green');
        } else {
            balancoElement.removeClass('green');
            balancoElement.addClass('red');
        }


        balancoElement.text(formatCurrency(balanco));


        var somaReceitas = totalReceitas;
        var somaDespesas = totalDespesas;
      
       // var balanco = somaReceitas - somaDespesas;
        $('#balanco').text(balanco.toFixed(2));
      
        // Atualizar as somas das receitas e despesas
        $('#soma-receitas').text(formatCurrency(somaReceitas));
        $('#soma-despesas').text(formatCurrency(somaDespesas));

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


    // Função para exportar o conteúdo para PDF

    function exportarParaPDF() {
        // Cria um novo documento PDF
        var doc = new jspdf.jsPDF({
            left: 20,
            right: 20,
            top: 20,
            bottom: 20
        });




        // Adiciona as tabelas ao documento PDF
        var receitasTable = $('#receitas-table');
        var despesasTable = $('#despesas-table');
        var balanco = $('#balanco');


        // Adiciona a tabela de receitas ao documento PDF
        addTableToPDF(doc, receitasTable, 'Tabela de Receitas');

        // Adiciona a tabela de despesas ao documento PDF
        addTableToPDF(doc, despesasTable, 'Tabela de Despesas');

        // Adiciona o balanço ao documento PDF


        // Adicionar título da tabela alinhado à direita
        doc.text('Balanço', doc.internal.pageSize.getWidth() - 20, doc.autoTable.previous.finalY + 20, { align: 'right' });

        // Adicionar texto do balanço alinhado à direita
        doc.text('R$ ' + balanco.text(), doc.internal.pageSize.getWidth() - 20, doc.autoTable.previous.finalY + 30, { align: 'right' });


        // Adicionar número de página no rodapé e cabeçalho
        // Adicionar número de página no rodapé e cabeçalho
        var pageCount = doc.internal.getNumberOfPages();
        for (var i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(0, 0, 0);
            doc.text('Página ' + i.toString() + ' de ' + pageCount.toString(), doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

            // Adicionar cabeçalho na primeira página
            if (i === 1) {
                doc.setFontSize(12);
                doc.setTextColor(255, 0, 0);
                doc.text('', doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });
            }
        }

        // Salva o documento PDF
        doc.save('relatorio.pdf');
    }

    // Função auxiliar para adicionar uma tabela ao documento PDF
    function addTableToPDF(doc, table, title) {
        // Clona a tabela original para não modificar a tabela na página
        var clonedTable = table.clone();

        // Verifica se a tabela é a tabela "Receitas" ou a primeira tabela
        var isFirstTable = clonedTable.is(':first-child');
        var isReceitasTable = clonedTable.find('th:first-child').text().trim() === 'Descrição' &&
            clonedTable.find('th:nth-child(2)').text().trim() === 'Valor' &&
            clonedTable.find('th:nth-child(3)').text().trim() === 'Ação';

        if (isReceitasTable && isFirstTable) {
            // Remove a coluna "Ação" da tabela clonada
            clonedTable.find('th:nth-child(3), td:nth-child(3)').remove();
        }

        // Verifica se a tabela é a tabela "Despesas"
        var isDespesasTable = clonedTable.find('th:first-child').text().trim() === 'Descrição' &&
            clonedTable.find('th:nth-child(2)').text().trim() === 'Valor' &&
            clonedTable.find('th:nth-child(3)').text().trim() === 'Pago';

        if (isDespesasTable) {
            // Remove a coluna "Ação" da tabela clonada
            clonedTable.find('th:nth-child(4), td:nth-child(4)').remove();
        }

        // Adicionar título da tabela
        var titleX = doc.internal.pageSize.getWidth() / 2; // Posição X centralizada
        var titleY = doc.autoTable.previous ? doc.autoTable.previous.finalY + 20 : 20; // Posição Y

        // Centralizar o texto horizontalmente
        var titleWidth = doc.getTextWidth(title); // Calcular a largura do texto
        var titleXOffset = titleWidth / 2; // Deslocamento necessário para centralizar

        // Adiciona o título ao documento PDF
        doc.text(title, titleX - titleXOffset, titleY);

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
            startY: doc.autoTable.previous ? doc.autoTable.previous.finalY + 30 : 30,
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



    /*
    function addTableToPDF(doc, table, tableName, tableTitle) {
        // Adicionar título da tabela
        var titleX = doc.internal.pageSize.getWidth() / 2; // Posição X centralizada
        var titleY = doc.autoTable.previous ? doc.autoTable.previous.finalY + 20 : 20; // Posição Y
  
        // Centralizar o texto horizontalmente
        var titleWidth = doc.getTextWidth(tableTitle); // Calcular a largura do texto
        var titleXOffset = titleWidth / 2; // Deslocamento necessário para centralizar
  
        doc.text(tableTitle, titleX - titleXOffset, titleY);
        // Adiciona a tabela clonada ao documento PDF
        doc.autoTable({ html: clonedTable.get(0), startY: doc.autoTable.previous ? doc.autoTable.previous.finalY + 30 : 30 });
    }
    */

    // Vincula o evento de clique ao botão "Exportar para PDF"
    $('#exportar-pdf').on('click', exportarParaPDF);



    // exportar excel
    // Função para exportar dados para Excel
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
            //var pagoReceita = receita.pago ? "Sim" : "Não";
            var pagoDespesa = despesa.pago ? "Sim" : "Não";
            dados.push([receita.descricao, receita.valor, despesa.descricao, despesa.valor, pagoDespesa]);
        }

        // Dados do balanço
        var balancoData = [[""], [""], ["Balanço: R$", $('#balanco').text()]];

        var dadosSheet = XLSX.utils.aoa_to_sheet(dados.concat(balancoData));
        XLSX.utils.book_append_sheet(wb, dadosSheet, "Dados");

        XLSX.writeFile(wb, "relatorio.xlsx");
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
                                valor: row[1],
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
                            valor: row[3],
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
