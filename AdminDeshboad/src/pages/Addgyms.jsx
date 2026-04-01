import React, { useState, useEffect } from 'react';

/**
 * Trainers page converted to Gym Registration Form.
 * Allows superadmins to register new gyms with various plans.
 */
const Addgyms = ( ) => {
   
  // Plan price mapping
  const planPrices = {
    '1 Month': 3299,
    '3 Months': 3000,
    '6 Months': 2800,
    '12 Months': 2600
  };

  // Single state object for all form data
  const [formData, setFormData] = useState({
    gymName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    planDuration: '1 Month',
    price: 3299
  });

  // Error state for basic validation
  const [errors, setErrors] = useState({});
  console.log(formData)

  // Automatically update price when planDuration changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      price: planPrices[prev.planDuration]
    }));
  }, [formData.planDuration]);

  // Common change handler for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Basic validation function
  const validate = () => {
    const newErrors = {};
    if (!formData.gymName.trim()) newErrors.gymName = 'Gym Name is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.address.trim()) newErrors.address = 'Gym Address is required';
    
    // Phone validation (required and numeric)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Phone Number must be numeric';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData)
    if (validate()) {
      console.log('Gym Registration Data:', formData);
      alert('Registration Successful! (Check console for data)');
      // Reset form or redirect
    } else {
      console.log('Validation Failed');
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gym Registration</h1>
        <p>Register a new gym to the management platform.</p>
      </header>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gymName">Gym Name</label>
              <input
                type="text"
                id="gymName"
                name="gymName"
                value={formData.gymName}
                onChange={handleChange}
                placeholder="Enter gym name"
                className={errors.gymName ? 'input-error' : ''}
              />
              {errors.gymName && <span className="error-text">{errors.gymName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ownerName">Owner Name</label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Enter owner name"
                className={errors.ownerName ? 'input-error' : ''}
              />
              {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="gym@example.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Set a password"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter numeric phone number"
                className={errors.phone ? 'input-error' : ''}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="planDuration">Plan Duration</label>
              <select
                id="planDuration"
                name="planDuration"
                value={formData.planDuration}
                onChange={handleChange}
              >
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="12 Months">12 Months</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="address">Gym Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete gym address"
              className={errors.address ? 'input-error' : ''}
              rows="3"
            ></textarea>
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="price-display">
            <h3>Plan Pricing</h3>
            <div className="price-tag">
              <span className="label">Selected Plan: {formData.planDuration}</span>
              <span className="amount">₹{formData.price}</span>
            </div>
          </div>

          <button type="submit" className="submit-btn">Register Gym</button>
        </form>
      </div>
    </div>
  );
};

export default Addgyms;
