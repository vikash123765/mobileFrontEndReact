import { useAtom } from 'jotai';
import { storeAtom } from '../lib/store';
import { ROOT, getToken } from '../lib/api.js';
import { clearCart } from '../lib/cart.js';
import { useNavigate } from 'react-router-dom';
import GuestCheckoutForm from '../components/GuestCheckoutForm.jsx';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import React, { useState, useEffect, useRef } from 'react';
import logoImage from '../Logo/postnord.png';

import '@fortawesome/fontawesome-free/css/all.min.css';
// Declare shippingCost state
const payPalOptions = {
    clientId: 'AV0M2rBqtYjM6MjDeL31vez-jyOjvQRZ8mHWO_svunBMxAk005tx2CsffnIautZsLfqcJkZJ3ftABVAb',
    currency: 'SEK',
    locale: "en_US"
};

export default function Cart() {
    const navigate = useNavigate();

  const [store, setStore] = useAtom(storeAtom);
  const [isPayPalButtonVisible, setIsPayPalButtonVisible] = useState(false); // Define isPayPa
  const [isSweden, setIsSweden] = useState(false);
  const [isNonTracable, setIsNonTracable] = useState(false);
  const [isEurope, setIsEurope] = useState(false);
  const [isTracable, setIsTracable] = useState(false);
  const [isPayPalButtonDisabled, setIsPayPalButtonDisabled] = useState(false);

  const [formData, setFormData] = useState(null);
  const isNonTracableRef = useRef(false);
  const isEuropeRef = useRef(false);
  const isSwedenRef = useRef(false);
  const isTracableRef = useRef(false);
  const [formFilled, setFormFilled] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(null);
  const [totalWithShipping, setTotalWithShipping] = useState(0);
  const totalRef = useRef(0);
  const formRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(/* Check if user is logged in */);
  const [isPayPalButtonEnabled, setIsPayPalButtonEnabled] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isFinalizingOrder, setIsFinalizingOrder] = useState(false);

  const [shippingCost, setShippingCost] = useState(null);
  let total = store.cart.reduce((acc, cv) => acc + cv.productPrice, 0);
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    switch (name) {
        case 'isSweden':
            setIsSweden(checked);
            isSwedenRef.current = checked;
            if (checked) {
                setIsEurope(false);
                isEuropeRef.current = false;
            }
            break;
        case 'isEurope':
            setIsEurope(checked);
            isEuropeRef.current = checked;
            if (checked) {
                setIsSweden(false);
                isSwedenRef.current = false;
            }
            break;
        case 'isTracable':
            setIsTracable(checked);
            isTracableRef.current = checked;
            if (checked) {
                setIsNonTracable(false);
                isNonTracableRef.current = false;
            }
            break;
        case 'isNonTracable':
            setIsNonTracable(checked);
            isNonTracableRef.current = checked;
            if (checked) {
                setIsTracable(false);
                isTracableRef.current = false;
            }
            break;
        default:
            break;
    }
};

const handleInputChange = () => {
    handleFormChange();
    updatePayPalButtonStatus().then(() => {
        setIsPayPalButtonEnabled(true);
    });
};
const isPayPalButtonEnabledRef = useRef(isPayPalButtonEnabled)
   // Function to update isPayPalButtonEnabled and the corresponding ref
   const updateIsPayPalButtonEnabled = (value) => {
    setIsPayPalButtonEnabled(value);
    isPayPalButtonEnabledRef.current = value;
};

// Corrected function to update isPayPalButtonEnabled
const updatePayPalButtonStatus = () => {
    const isShippingOptionsValid =
        (isSwedenRef.current || isEuropeRef.current) &&
        (isTracableRef.current || isNonTracableRef.current);

    console.log('isShippingOptionsValid:', isShippingOptionsValid);

    // Enable the PayPal button if the user is logged in or if shipping options are valid
    setIsPayPalButtonEnabled(isLoggedIn || isShippingOptionsValid);

    console.log('PayPal button status updated:', isLoggedIn || isShippingOptionsValid);
};

const handleFormChange = () => {
    const form = document.getElementById('guestCheckoutForm');
    const newFormData = new FormData(form);

    setFormData(newFormData);

    const isFilled =
        newFormData.get('userName') &&
        newFormData.get('email') &&
        newFormData.get('shippingAddress') &&
        newFormData.get('phoneNumber');

    setFormFilled(isFilled);

    // Check if all fields have strings
    const formFilled = [...newFormData.values()].every((value) => value.trim() !== '');
    setFormFilled(formFilled);

    // Check if all required fields and shipping alternatives are selected
    const isFormValid = validateForm(newFormData)
       setIsPayPalButtonEnabled(isFormValid);

 
};



    useEffect(() => {
        // Function to clear all items from local storage except tokens
        const clearLocalStorageExceptTokens = () => {
            for (let key in localStorage) {
                // Check if the key contains a token (you might adjust this condition based on your token key)
                if(!key.includes('token')) {
                    localStorage.removeItem(key);
                }
            }
        };

        // Call the function to clear local storage except tokens
        clearLocalStorageExceptTokens();

        const form = document.getElementById('guestCheckoutForm');
        if (form) {
            form.addEventListener('input', handleFormChange);
        }

        return () => {
            if (form) {
                form.removeEventListener('input', handleFormChange);
            }
        };
    }, []);




    const handleCalculateShipping = async () => {
        try {
            setIsCalculatingShipping(true);
            if (!store.cart || store.cart.length === 0) {
                console.error('Cart is empty.');
                return;
            }

            const weightMapping = {
                9: 27, // Use the actual product ID here
                11: 27, // Use the actual product ID here
                10: 47,
                12: 27,

                14: 27,
                15: 27,
                16: 37,
                17: 37,
                18: 37,
                19: 27,
                20: 27,
                21: 47,
                22: 37,
                23: 37,
                24: 37,
                25: 37,
                26: 47,
                27: 27,


                30: 27,
                31: 27,

                34: 27,



                38: 29,

                40: 28,




                45: 27,
                46: 27,
                47: 27,
                48: 27,
                49: 27,
                50: 27,

                53: 27,
                54: 27,
                55: 27,
                56: 27,
                57: 27,
                58: 27,

                60: 27,
                61: 27,
                
                69: 27,

                65: 27,
                66: 27,

                70: 25,
                71: 27,
                73: 37,
                74: 37


            };


            // Calculate the total order weight based on the weights of individual products in the cart
            const orderWeight = store.cart.reduce((totalWeight, product) => {
                const productId = product.productId; // Assuming product ID is stored in 'productId' property
                const productWeight = weightMapping[productId] || 0; // Get weight from weightMapping
                totalWeight += productWeight;
                return totalWeight;
            }, 0);

            console.log(orderWeight);

            const response = await fetch(
                `https://api.vtscases.com/calculate-shipping-rates/${isSweden.toString()}/${isEurope.toString()}/${isTracable.toString()}/${isNonTracable.toString()}/${orderWeight}`,
                {
                    method: 'GET',
                    mode: 'cors', // Inclusde 'mode: cors' for CORS
                }
            );

            if (response.ok) {
                const result = await response.json();
                console.log('Shipping Cost Response:', result);

                const { shippingCost, message } = result;

                if (typeof shippingCost === 'number' && !isNaN(shippingCost)) {
                    console.log('Shipping Pricee:', shippingCost);
                    console.log('Shipping Message:', message);

                    // Calculate the new totalWithShipping
                    const newTotalWithShipping = total + shippingCost;

                    // Update both shippingPrice and totalWithShipping
                    setShippingPrice(shippingCost);
                    setTotalWithShipping(newTotalWithShipping);

                    // Set the shippingCost in the state
                    setShippingCost(result);
                    updatePayPalButtonStatus();
                } else {
                    console.error('Invalid shipping cost:', shippingCost);
                }
            } else {
                console.error('Error calculating shipping rates');
            }
        } catch (error) {
            console.error('Errrrrror in handleCalculateShipping:', error);
        } finally {
            setIsCalculatingShipping(false);
        }
    };
   
   // ...

const validateForm = (data, isLoggedIn) => {
    if (isLoggedIn) {
        // For logged-in users, only validate shipping options (checkboxes)
        return (isSwedenRef.current || isEuropeRef.current) &&
               (isTracableRef.current || isNonTracableRef.current);
    } else {
        // For guest users, validate both shipping form fields and options
        const isShippingFormValid =
            data?.get('userName') &&
            data?.get('email') &&
            data?.get('shippingAddress') &&
            data?.get('phoneNumber');

        const isShippingOptionsValid =
            (isSwedenRef.current || isEuropeRef.current) &&
            (isTracableRef.current || isNonTracableRef.current);

        return isShippingFormValid && isShippingOptionsValid;
    }
};

// ...

const isFormValid = validateForm(formData, store.loggedIn);


    // For guest users
const isFormValidForGuest = validateForm(formData, false);

// For logged-in users
const isFormValidForLoggedInUser = validateForm(null, true);
    

    const userCheckout = async (data, actions) => {

        setIsPlacingOrder(true); // Set loading state
        try {
            const order = await actions.order.capture();
            console.log('Oorder:', order);

            const res = await fetch(ROOT + '/finalizeOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: getToken(),
                },
                body: JSON.stringify(store.cart.map((p) => p.productId)),
            });

            console.log('Response:', res);

            if (!res.ok) {
                alert('Something went wrong with finalizing the order');
                console.log(res);
                return;
            }

            console.log('Order finalized successfully');

            setIsPlacingOrder(false); // Set loading state
            alert('Order placed !!');

            clearCart(setStore);
            navigate('/');
        } catch (error) {
            console.error('Error in userCheckout:', error);
        }
    };

    const guestCheckout = async (e) => {
        setIsPlacingOrder(true); // Set loading state


        // e.preventDefault();
        // const form = e.target;
        // const data = Object.fromEntries(new FormData(form));
        try {


            console.log("Bdody", JSON.stringify({
                jsonPayload: JSON.stringify(store.cart.map((p) => p.productId)),
                guestOrderRequest: e,
            }))

            console.log("Json Pay Load", JSON.stringify(store.cart.map((p) => p.productId)));

            const res = await fetch(ROOT + '/finalizeGuestOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonPayload: JSON.stringify(store.cart.map((p) => p.productId)),
                    guestOrderRequest: e,
                }),
            });

            if (!res.ok) {
                alert('Something went wrong with finalizing the guest order');
                console.log(res);
                return;
            }

            console.log('Guest order finalized successfully');
            setIsPlacingOrder(false); // Reset loading state
            alert('Order placed !!');
            clearCart(setStore);
            console.log("response data", res)
            navigate('/');
        } catch (error) {
            console.error('Error in guestCheckout:', error);
        } finally {
            setIsPlacingOrder(false); // Reset loading state
        }
    };



    const handleApprove = (data, actions) => {
        setIsPlacingOrder(true); 
    
        return actions.order
            .capture()
            .then(function (details) {
                const orderStatus = details.status;
                if (orderStatus === 'COMPLETED') {
                    window.alert('Payment Successful'); // Display payment success alert
                    if (store.loggedIn) {
                        userCheckout(data, actions)
                            .then(() => {
                                // Order placed successfully
                                // No need to display another alert here
                            })
                            .catch((error) => {
                                console.error('Error in userCheckout:', error);
                                window.alert('Order placement failed');
                            })
                            .finally(() => {
                                setIsPlacingOrder(false); // Reset loading state
                            });
                    } else {
                        const form = document.getElementById('guestCheckoutForm');
                        const formData = Object.fromEntries(new FormData(form));
                        guestCheckout(formData)
                            .then(() => {
                                // Order placed successfully
                                // No need to display another alert here
                            })
                            .catch((error) => {
                                console.error('Error in guestCheckout:', error);
                                window.alert('Order placement failed');
                            })
                            .finally(() => {
                                setIsPlacingOrder(false); // Reset loading state
                            });
                    }
                } else {
                    console.error('Order capture status:', orderStatus);
                    window.alert('Payment Failed'); // Notify user about payment failure
                    setIsPlacingOrder(false); // Reset loading state
                }
            })
            .catch((err) => {
                console.error('Capture Error', err);
                window.alert('Payment Failed');
                setIsPlacingOrder(false); // Reset loading state
            });
    };
    

    /*  useEffect(() => {
         handleCalculateShipping(isSweden, isEurope, isTracable, isNonTracable);
     }, [isSweden, isEurope, isTracable, isNonTracable]);
     
     useEffect(() => {
         handleCalculateShipping();
     }, [isSwedenRef.current, isEuropeRef.current, isTracableRef.current, isNonTracableRef.current]);
      */

    useEffect(() => {
        handleCalculateShipping(isSwedenRef.current, isEuropeRef.current, isTracableRef.current, isNonTracableRef.current);
    }, [isSwedenRef.current, isEuropeRef.current, isTracableRef.current, isNonTracableRef.current]);

    useEffect(() => {
        isPayPalButtonEnabledRef.current = isPayPalButtonEnabled;
    }, [isPayPalButtonEnabled]);
    
    useEffect(() => {
        totalRef.current = total;
        const calculateTotalWithShipping = () => {
            setTotalWithShipping(total + (shippingPrice || 0));
        };
        console.log("totalshippingUseEffect", totalWithShipping);
        calculateTotalWithShipping();
    }, [total, shippingPrice]);

    
        return (
            <div>
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7185928504834368"
     crossorigin="anonymous"></script>
                <h3>Your order</h3>
                {store.cart.length ? (
                    <>
                        <form id="cart_form">
                        <div id="cart">
                            {store.cart.map((p, i) => {
                     function remove() {
                        setStore((current) => {
                            current.cart.splice(
                                current.cart.findIndex((item) => item.productId === p.productId),
                                1
                            );
                            return { ...current };
                        });
                    }
                                return (
                                    <div className="cart-item" key={p.productName + i}>
                                        <div className="left">
                                            <img src={`${p.image}`} alt="" />
                                        </div>
                                        <div className="right" style={{ padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <div>{p.productName}</div>
                                            <div>Kr{p.productPrice.toFixed(2)}</div>
                                            {window.innerWidth <= 768 && <span className="remove-icon" onClick={remove}>×</span>} {/* Added an "×" icon for mobile screens */}
                                            <button onClick={remove} type="button">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="foot">
                        <h4 id="cart_total">
                       

                                Total: {store && store.cart ? `${totalWithShipping.toFixed(2)}SEK` : 'N/A'}
                            </h4>
                            <div>
                            {Object.entries(store.cart.reduce((acc, cv) => {
    if (!acc[cv.productName]) {
        acc[cv.productName] = {
            count: 1,
            totalPrice: cv.productPrice,
            individualPrice: cv.productPrice
        };
    } else {
        acc[cv.productName].count++;
        acc[cv.productName].totalPrice += cv.productPrice;
    }
    return acc;
}, {})).map(([productName, { count, totalPrice, individualPrice }]) => (
    <div key={productName}>
        <p>{productName} {individualPrice.toFixed(2)} Kr x {count} = Kr{totalPrice.toFixed(2)} </p> <br></br>
    </div>
))}
    <p>
    {Object.entries(store.cart.reduce((acc, cv) => {
        if (!acc[cv.productName]) {
            acc[cv.productName] = {
                count: 1,
                totalPrice: cv.productPrice,
                individualPrice: cv.productPrice
            };
        } else {
            acc[cv.productName].count++;
            acc[cv.productName].totalPrice += cv.productPrice;
        }
        return acc;
    }, {})).reduce((output, [productName, { totalPrice }], index, array) => {
        output += `Kr${totalPrice.toFixed(2)}`;
        if (index !== array.length - 1) {
            output += " + ";
        }
        return output;
    }, "")}
    {shippingPrice !== null ? ` + Shipping: Kr${shippingPrice.toFixed(2)}` : ""} = Total: {store && store.cart ? `${totalWithShipping.toFixed(2)} SEK` : 'N/A'}
</p>

<br></br>
                            {shippingPrice !== null && !isNaN(shippingPrice) && (
                                <div>
                                    Shipping Cost: Kr{Number(shippingPrice).toFixed(2)}
                                    {shippingCost && shippingCost.message && <span> ({shippingCost.message})</span>}
                                </div>
                            )}
                            {isPlacingOrder && <div className="loading-icon"><i className="fas fa-spinner fa-spin"></i></div>}
                            {isFinalizingOrder && <div className="loading-icon"><i className="fas fa-spinner fa-spin"></i></div>}
                            <br></br>

</div>


                            {store.loggedIn && store.user && (
                              <div>
                              <strong>Shipping Address:</strong>  <br /> {store.user.address}  <br /> 
                              
                              <strong>Phone Number:</strong> +  <br />{store.user.phoneNumber}  <br /> 
                              <strong>Email:</strong><br />  {store.user.userEmail}  <br /> 
                              <strong>Name:</strong> <br></br>{store.user.userName}
                          </div>
                            )}
                            <p> <img src={logoImage} alt="PostNord" style={{ width: '110px', height: 'auto', marginBottom: '10px' }} /></p>
                            <div className="shipping-form">
                            
                                
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isSweden"
                                        checked={isSweden}
                                        onChange={handleCheckboxChange}
                                    />
                                    Sweden
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isEurope"
                                        checked={isEurope}
                                        onChange={handleCheckboxChange}
                                    />
                                    Europe
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isTracable"
                                        checked={isTracable}
                                        onChange={handleCheckboxChange}
                                    />
                                    Traceable
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isNonTracable"
                                        checked={isNonTracable}
                                        onChange={handleCheckboxChange}
                                    />
                                    Non-Traceable
                                </label>
                            </div>
                            <p>Always reselect shipping options if you alter the cart products </p>
                           
                        </div>
                    </form>
                    {store.cart.length > 0 && !store.loggedIn && (
                        <GuestCheckoutForm guestCheckout={guestCheckout} />
                    )}
              
                    <>
                    <div className={`custom-paypal-buttons ${store.loggedIn && window.innerWidth > 768 ? 'centered-paypal-button' : ''}`}>
    
                            <PayPalScriptProvider options={payPalOptions}>
                                <PayPalButtons
                               
                                    createOrder={(data, actions) => {
                                        
                                            const weightMapping = {
                                                9: 27, // Use the actual product ID here
                                                11: 27, // Use the actual product ID here
                                                10: 47,
                                                12: 27,

                                                14: 27,
                                                15: 27,
                                                16: 37,
                                                17: 37,
                                                18: 37,
                                                19: 27,
                                                20: 27,
                                                21: 47,
                                                22: 37,
                                                23: 37,
                                                24: 37,
                                                25: 37,
                                                26: 47,
                                                27: 27,


                                                30: 27,
                                                31: 27,

                                                34: 27,



                                                38: 29,

                                                40: 28,




                                                45: 27,
                                                46: 27,
                                                47: 27,
                                                48: 27,
                                                49: 27,
                                                50: 27,

                                                53: 27,
                                                54: 27,
                                                55: 27,
                                                56: 27,
                                                57: 27,
                                                58: 27,

                                                60: 27,
                                                61: 27,


                                                65: 27,
                                                66: 27,
                                                69: 27,
                                                70: 25,
                                                71: 27,
                                                73: 37,
                                                74: 37


                                            };

                            
                                        // Calculate the total order weight based on the weights of individual products in the cart
                                        const orderWeight = store.cart.reduce((totalWeight, product) => {
                                            const productId = product.productId; // Assuming product ID is stored in 'productId' property
                                            const productWeight = weightMapping[productId] || 0; // Get weight from weightMapping
                                            totalWeight += productWeight;
                                            return totalWeight;
                                        }, 0);
                            
                                        console.log(orderWeight);
                                        const selectedIsSweden = isSwedenRef.current.toString();
                                        const selectedisTracable = isTracableRef.current.toString();
                                        const selectedisEurope = isEuropeRef.current.toString();
                                        const selectedisNonTracable = isNonTracableRef.current.toString();
                                        return new Promise(async (resolve, reject) => {
                                            try {
                                                const response = await fetch(
                                                    `https://api.vtscases.com/calculate-shipping-rates/${selectedIsSweden}/${selectedisEurope}/${selectedisTracable}/${selectedisNonTracable}/${orderWeight}`,
                                                    {
                                                        method: 'GET',
                                                        mode: 'cors', // Include 'mode: cors' for CORS
                                                    }
                                                    );
                                                if (response.ok) {
                                                    const result = await response.json();
                                                    const { shippingCost } = result;
                                                    if (typeof shippingCost === 'number' && !isNaN(shippingCost)) {
                                                        let total = store.cart.reduce((acc, cv) => acc + cv.productPrice, 0);

                                                        const totalWithShippingValue = (total + shippingCost).toFixed(2);
                                                        resolve(
                                                            actions.order.create({
                                                                purchase_units: [
                                                                    {
                                                                        amount: {
                                                                            value: totalWithShippingValue,
                                                                            currency_code: 'SEK',
                                                                        },
                                                                    },
                                                                ],
                                                            })
                                                        );
                                                       
                                                    } else {
                                                        console.error('Invalid shipping cost:', shippingCost);
                                                        reject(new Error('Invalid shipping cost'));
                                                    }
                                                } else {
                                                    console.error('Error calculating shipping rates');
                                                    reject(new Error('Error calculating shipping rates'));
                                                }
                                            } catch (error) {
                                                console.error('Error in createOrder:', error);
                                                reject(error);
                                            }
                                        });
                                    }}
                                    onApprove={(paypalData, actions) => handleApprove(paypalData, actions)}
                                    onSuccess={(details, paypalData) => {
                                        console.log('Transaction completed by ' + details.payer.name);
                                    }}
                                    onError={(err) => {
                                        console.error('PayPal error', err);
                                    }}
                    
                                    disabled={!isFormValid}

                                    
    // other props...
    onClick={() => {
        console.log('isPayPalButtonEnabledRef:', isPayPalButtonEnabledRef.current);

        if (!isPayPalButtonEnabledRef.current) {

            alert('Please fill out all required fields and select a shipping otion.');
        }
    }}
                                />
                                
                                    
                                    
            
                                
                            </PayPalScriptProvider>
                        </div>
                    </>
                
            </>
        ) : (
            <div>Your cart is empty.</div>
        )}
    </div>
);

        }