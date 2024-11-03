const invertButton = document.getElementById('invert-button');
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
    return !isNaN(numberValue) && numberValue >= 0 ? numberValue : null;
};

// Função pura para converter valores
const convertCurrency = (amount, rates, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) {
        return amount; // Retorna o mesmo valor se as moedas forem iguais
    }
    const amountInBRL = amount / rates[fromCurrency];
    return amountInBRL * rates[toCurrency];
};

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
    
    // Validação de entrada
    const amount = validateInput(inputAmount.value);

    if (amount === null) {
        outputAmount.value = 'Valor inválido';
        conversionRate.textContent = '';
        exchangeTime.textContent = '';
        return;
    }

    const convertedAmount = convertCurrency(amount, rates, fromCurrency, toCurrency);
    outputAmount.value = formatCurrency(convertedAmount);
    conversionRate.textContent = `${formatCurrency(amount)} ${fromCurrency} = ${outputAmount.value} ${toCurrency}`;

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

// Eventos
invertButton.addEventListener('click', () => {
    const tempValue = selectFrom.value;
    selectFrom.value = selectTo.value;
    selectTo.value = tempValue;

    updateFlags();
    convertValues();
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
    convertValues(); // Atualiza a conversão
});

inputAmount.addEventListener('input', () => {
    // Permite que o usuário digite o valor normalmente
    // A formatação será aplicada ao perder o foco
    convertValues(); // Atualiza a conversão
});

selectFrom.addEventListener('change', () => {
    updateFlags();
    convertValues();
});

selectTo.addEventListener('change', () => {
    updateFlags();
    convertValues();
});
