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

  // Renderizar Despesas
  function renderDespesas() {
    var despesasTable = $('#despesas-table tbody');
    despesasTable.empty();

    for (var i = 0; i < despesas.length; i++) {
      var despesa = despesas[i];

      var row = '<tr>' +
        '<td class="four wide column">' + capitalizeDescription(despesa.descricao) + '</td>' +
        '<td class="four wide column">' + despesa.valor + '</td>' +
        '<td class="two wide column"><button class="ui negative button excluir-despesa" data-index="' + i + '" data-content="Excluir Despesa" data-position="top center"><i class="trash icon"></i></button></td>' +
        '</tr>';

      despesasTable.append(row);
    }
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

    if (balanco >= 0) {
      balancoElement.removeClass('red');
      balancoElement.addClass('green');
    } else {
      balancoElement.removeClass('green');
      balancoElement.addClass('red');
    }

    balancoElement.text(formatCurrency(balanco));
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


    // Salva o documento PDF
    doc.save('relatorio.pdf');
  }

  // Função auxiliar para adicionar uma tabela ao documento PDF
  function addTableToPDF(doc, table, title) {
    // Clona a tabela original para não modificar a tabela na página
    var clonedTable = table.clone();

    // Remove a coluna "Ação" da tabela clonada
    clonedTable.find('th:nth-child(3), td:nth-child(3)').remove();


    // Adicionar título da tabela
    var titleX = doc.internal.pageSize.getWidth() / 2; // Posição X centralizada
    var titleY = doc.autoTable.previous ? doc.autoTable.previous.finalY + 20 : 20; // Posição Y

    // Centralizar o texto horizontalmente
    var titleWidth = doc.getTextWidth(title); // Calcular a largura do texto
    var titleXOffset = titleWidth / 2; // Deslocamento necessário para centralizar

    // Adiciona o título ao documento PDF
    doc.text(title, titleX - titleXOffset, titleY);

    // Adiciona a tabela clonada ao documento PDF
    doc.autoTable({ html: clonedTable.get(0), startY: doc.autoTable.previous ? doc.autoTable.previous.finalY + 30 : 30 });

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
  function exportarParaExcel() {
    var wb = XLSX.utils.book_new();

    // Cabeçalhos
    var cabecalhos = ["Receitas", "Valor", "Despesas", "Valor"];

    // Dados das receitas e despesas
    var dados = [];
    dados.push(cabecalhos); // Adiciona os cabeçalhos como a primeira linha
    var maxLinhas = Math.max(receitas.length, despesas.length);
    for (var i = 0; i < maxLinhas; i++) {
      var receita = receitas[i] || {};
      var despesa = despesas[i] || {};
      dados.push([receita.descricao, receita.valor, despesa.descricao, despesa.valor]);
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
            console.log(row[0])
            if (row[0] != "Balanço: R$") {
              receitas.push({
                descricao: row[0],
                valor: row[1]
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
              valor: row[3]
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


});
