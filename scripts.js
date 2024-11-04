const invertButton = document.getElementById('invert-button');
const convertButton = document.getElementById('convert-button'); // Referência ao novo botão
const inputAmount = document.getElementById('input-amount');
const outputAmount = document.getElementById('output-amount');
const selectFrom = document.getElementById('currency-from-select');
const selectTo = document.getElementById('currency-to-select');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');
const conversionRate = document.getElementById('conversion-rate');
const exchangeTime = document.getElementById('exchange-time');

// Função pura para formatar valores como moeda
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

// Função pura para validar se o valor é numérico e positivo
const validateInput = (value) => {
    const numberValue = parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.').trim());
    return !isNaN(numberValue) && numberValue > 0 ? numberValue : null;
};

// Função pura para converter valores
const convertCurrency = (amount, rates, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) {
        return amount; // Se as moedas forem iguais, retorna o mesmo valor
    }
    const amountInBRL = amount * rates[fromCurrency]; // Converte o valor de entrada para BRL
    return amountInBRL / rates[toCurrency]; // Retorna o valor convertido
};

// Função para converter uma lista de valores
const convertValuesBatch = (amounts, rates, fromCurrency, toCurrency) => {
    return amounts.map(amount => convertCurrency(amount, rates, fromCurrency, toCurrency));
};

// Função de conversão que será chamada quando o botão "Converter" for clicado
const convertValues = async () => {
    let moedas = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL").then(result => result.json());

    const rates = {
        'BRL': 1,
        'USD': moedas.USDBRL.high,
        'EUR': moedas.EURBRL.high,
        'BTC': moedas.BTCBRL.high,
    };

    const fromCurrency = selectFrom.value;
    const toCurrency = selectTo.value;
    
    // Obtém os valores do campo de entrada
    const amountsArray = inputAmount.value.split(',').map(value => validateInput(value.trim())).filter(value => value !== null);

    // Verifica se há valores válidos para conversão
    if (amountsArray.length === 0) {
        outputAmount.value = 'Nenhum valor válido inserido.';
        conversionRate.textContent = '';
        exchangeTime.textContent = '';
        return;
    }

    // Converte os valores em lote
    const convertedAmounts = convertValuesBatch(amountsArray, rates, fromCurrency, toCurrency);
    outputAmount.value = convertedAmounts.map(amount => formatCurrency(amount)).join(', '); // Formata e junta os valores convertidos

    // Atualiza a taxa de conversão
    conversionRate.textContent = `${amountsArray.map(amount => formatCurrency(amount)).join(', ')} ${fromCurrency} = ${outputAmount.value} ${toCurrency}`;

    // Obtém a hora atual no formato desejado
    const now = new Date();
    exchangeTime.textContent = `Câmbio comercial às ${now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    })} UTC`;
};

const updateFlags = () => {
    const fromFlagSrc = selectFrom.options[selectFrom.selectedIndex].getAttribute('data-flag');
    const toFlagSrc = selectTo.options[selectTo.selectedIndex].getAttribute('data-flag');
    fromFlag.src = fromFlagSrc;
    toFlag.src = toFlagSrc;
};

// Adicionando eventos de 'change' para atualizar as bandeiras automaticamente
selectFrom.addEventListener('change', updateFlags);
selectTo.addEventListener('change', updateFlags);

// Função para permitir apenas números e vírgula
inputAmount.addEventListener('input', () => {
    // Permite apenas números e vírgulas
    inputAmount.value = inputAmount.value.replace(/[^0-9,]/g, '');
});

// Formatação de moeda ao perder o foco
inputAmount.addEventListener('blur', () => {
    let value = inputAmount.value.replace(/[^\d,]/g, '').replace(',', '.');
    let numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
        inputAmount.value = formatCurrency(numericValue); // Formata como moeda
    } else {
        inputAmount.value = '';
    }
});

// Adicionando evento ao botão de conversão
convertButton.addEventListener('click', convertValues);

invertButton.addEventListener('click', () => {
    const tempValue = selectFrom.value;
    selectFrom.value = selectTo.value;
    selectTo.value = tempValue;

    updateFlags();
});
