document.querySelectorAll('.js-signup-form').forEach((form) => {
  const panels = {
    monthly: form.querySelector('[data-panel="monthly"]'),
    once: form.querySelector('[data-panel="once"]'),
  };
  const message = form.querySelector('.form-message');

  function selectedDonation() {
    const checked = form.querySelector('input[name="donationType"]:checked');
    return checked ? checked.value : '';
  }

  function syncPanels() {
    const donation = selectedDonation();
    for (const [name, panel] of Object.entries(panels)) {
      const show = donation === name;
      panel.hidden = !show;
      panel.querySelectorAll('input').forEach((input) => {
        input.disabled = !show;
        if (name === 'monthly' || name === 'once') {
          input.required = show;
        }
      });
    }
  }

  function emailError(value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'Enter an email address like name@example.com.';
    }
    return '';
  }

  function phoneError(value) {
    const compact = String(value).replace(/[\s().-]/g, '');
    if (!/^\+?\d+$/.test(compact)) {
      return 'Enter a phone number using digits, for example 07123 456789.';
    }
    if (compact.startsWith('+') && !compact.startsWith('+44')) {
      const count = compact.length - 1;
      if (count < 8 || count > 15) {
        return 'Enter the full phone number, including the country code.';
      }
      return '';
    }
    let national = compact;
    if (national.startsWith('+44')) national = national.slice(3);
    else if (national.startsWith('0044')) national = national.slice(4);
    else if (national.startsWith('0')) national = national.slice(1);
    else {
      return 'Start a UK phone number with 0 or +44.';
    }
    if (national.startsWith('0')) national = national.slice(1);
    if (national.length !== 10) {
      return 'That phone number looks short or long. A UK number is 11 digits, or +44 followed by 10 digits.';
    }
    return '';
  }

  function addressError(value) {
    if (value.length < 12 || !/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i.test(value)) {
      return 'Include the house number, street and postcode, for example 12 Beech Road, M21 9EG.';
    }
    return '';
  }

  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => input.setCustomValidity(''));
  });

  form.querySelectorAll('input[name="donationType"]').forEach((input) => {
    input.addEventListener('change', syncPanels);
  });
  syncPanels();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.className = 'form-message';
    message.textContent = '';
    form.querySelectorAll('input, textarea').forEach((input) => input.setCustomValidity(''));

    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    const address = form.querySelector('[name="address"]');
    email.setCustomValidity(emailError(email.value.trim()));
    phone.setCustomValidity(phoneError(phone.value.trim()));
    address.setCustomValidity(addressError(address.value.trim()));

    if (!form.reportValidity()) {
      return;
    }

    const data = new FormData(form);
    const payload = {
      form: form.dataset.form,
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      address: data.get('address'),
      donationType: data.get('donationType'),
      monthlyAmount: data.get('monthlyAmount'),
      onceAmount: data.get('onceAmount'),
      confirmRules: data.get('confirmRules') === 'yes',
      confirmApproval: data.get('confirmApproval') === 'yes',
    };

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || 'Could not start payment');
      }
      window.location.href = body.url;
    } catch (error) {
      message.textContent = error.message;
      message.className = 'form-message error';
      button.disabled = false;
    }
  });
});
