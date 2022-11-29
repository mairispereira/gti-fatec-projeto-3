/**
 * salvar
 * Salva os dados do formulário na collection do Firebase
 * @param {object} event - Evento do objeto que foi clicado
 * @param {string} collection - Nome da collection que será salva no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */

function salvar(event, collection) {
    event.preventDefault() // evita que o formulário seja recarregado
    //Verificando os campos obrigatórios
    if (document.getElementById('nomeTutor').value === '') { alert('⚠ É obrigatório informar o nome!') }
    else if (document.getElementById('email').value === '') { alert('⚠ É obrigatório informar o email!') }
    else if (document.getElementById('nascimento').value === '') { alert('⚠ É obrigatório informar a data de Nascimento!') }
    else if (document.getElementById('id').value !== '') { alterar(event, collection) }
    else { incluir(event, collection) }
}

function incluir(event, collection) {
    event.preventDefault() // evita que o formulário seja recarregado
    //Obtendo os campos do formulário
    const form = document.forms[0]
    const data = new FormData(form)
    //Obtendo os valores dos campos
    const values = Object.fromEntries(data.entries())
    //console.log(`Os dados são:`)
    //console.log(values)
    //O retorno é uma Promise (promessa)
    return firebase.database().ref(collection).push(values)
        .then(() => {
            alert('✔ Registro cadastrado com sucesso!')
            document.getElementById('formCadastro').reset() //limpar o formulário
        })
        .catch(error => {
            console.error(`Ocorreu um erro: ${error.code}-${error.message}`)
            alert(`❌ Falha ao incluir: ${error.message}`)
        })
}

/**
 * obtemDados.
 * Obtém os dados da collection a partir do Firebase.
 * @param {string} collection - Nome da Collection no Firebase
 * @return {object} - Uma tabela com os dados obtidos
 */
function obtemDados(collection) {
    var tabela = document.getElementById('tabelaDados')
    firebase.database().ref(collection).on('value', (snapshot) => {
        tabela.innerHTML = ''
        let cabecalho = tabela.insertRow()
        cabecalho.className = 'table-danger'
        cabecalho.insertCell().textContent = 'Tutor'
        cabecalho.insertCell().textContent = 'Pet'
        cabecalho.insertCell().textContent = 'Nascimento'
        cabecalho.insertCell().textContent = 'E-mail'
        cabecalho.insertCell().textContent = 'Peso'
        cabecalho.insertCell().textContent = 'Sexo'
        cabecalho.insertCell().textContent = 'Raça'
        cabecalho.insertCell().textContent = 'Opções'

        snapshot.forEach(item => {
            //Dados do Firebase
            let db = item.ref.path.pieces_[0] 
            let id = item.ref.path.pieces_[1]
            let registro = JSON.parse(JSON.stringify(item.val()))
            //Criando as novas linhas na tabela
            let novalinha = tabela.insertRow()
            novalinha.insertCell().textContent = item.val().nomeTutor
            novalinha.insertCell().textContent = item.val().nomePet
            novalinha.insertCell().textContent = item.val().nascimento
            novalinha.insertCell().textContent = item.val().email
            novalinha.insertCell().textContent = item.val().Peso
            novalinha.insertCell().textContent = item.val().sexo
            novalinha.insertCell().textContent = item.val().raca
            novalinha.insertCell().innerHTML =
                `
            <button class ='btn btn-dark' title='Remove o registro corrente' onclick=remover('${db}','${id}')>🗑 Excluir </button>
            <button class ='btn btn-light' title='Edita o registro corrente' onclick=carregaDadosAlteracao('${db}','${id}')>🖋 Editar </button>
            `
        })
        let rodape = tabela.insertRow()
        rodape.className = 'table-danger'
        rodape.insertCell().textContent = ''
        rodape.insertCell().textContent = ''
        rodape.insertCell().textContent = ''
        rodape.insertCell().innerHTML = totalRegistros(collection)
        rodape.insertCell().textContent = ''
        rodape.insertCell().textContent = ''
        rodape.insertCell().textContent = ''
        rodape.insertCell().textContent = ''
    })
}

/** 
 * totalRegistros.
 * Retorna a contagem total do número de registros da collection informada
 * @param {string} collection - Nome da Collection no Firebase
 * @return {string} - Texto com o total de registros
* */
function totalRegistros(collection) {
    var retorno = '...'
    firebase.database().ref(collection).on('value', (snapshot) => {
        if (snapshot.numChildren() === 0) {
            retorno = '‼ Ainda não há nenhum registro cadastrado!'
        } else {
            retorno = `Total de Registros: ${snapshot.numChildren()}`
        }
    })
    return retorno
}

/**
 * remover
 * Remove os dados da collection a partir do id informado
 * @param {string} db - Nome da collection no Firebase
 * @param {integer} id - Id do registro no Firebase
 * @return {null} - Snapshot atualizado dos dados
 */
function remover(db, id) {
    //Iremos confirmar com o usuário
    if (window.confirm('🔴Deseja realmente excluir?')) {
        let dadoExclusao = firebase.database().ref().child(db + '/' + id)
        dadoExclusao.remove()
            .then(() => {
                alert('Registro removido ☹!')
            })
            .catch(error => {
                alert('❌Falha ao excluir: ' + error.message)
            })
    }
}

function carregaDadosAlteracao(db, id) {
    firebase.database().ref(db).on('value', (snapshot) => {
        snapshot.forEach(item => {
            if (item.ref.path.pieces_[1] === id) {
                document.getElementById('id').value = item.ref.path.pieces_[1]
                document.getElementById('nomeTutor').value = item.val().nomeTutor
                document.getElementById('nomePet').value = item.val().nomePet
                document.getElementById('email').value = item.val().email
                document.getElementById('nascimento').value = item.val().nascimento
                document.getElementById('Peso').value = item.val().Peso
                document.getElementById('raca').value = item.val().raca
                if (item.val().sexo === 'Macho') {
                    document.getElementById('sexoM').checked = true
                } else {
                    document.getElementById('sexoF').checked = true
                }
            }
        })
    })
}

function alterar(event, collection) {
    event.preventDefault()
    //Obtendo os campos do formulário
    const form = document.forms[0];
    const data = new FormData(form);
    //Obtendo os valores dos campos
    const values = Object.fromEntries(data.entries());
    console.log(values)
    //Enviando os dados dos campos para o Firebase
    return firebase.database().ref().child(collection + '/' + values.id).update({
        nomeTutor: values.nomeTutor,
        nomePet: values.nomePet,
        email: values.email,
        sexo: values.sexo,
        nascimento: values.nascimento,
        Peso: values.Peso,
        raca: values.raca,
    })
        .then(() => {
            alert('✅ Registro alterado com sucesso!')
            document.getElementById('formCadastro').reset()
        })
        .catch(error => {
            console.log(error.code)
            console.log(error.message)
            alert('❌ Falha ao alterar: ' + error.message)
        })
}