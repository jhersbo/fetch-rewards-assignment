import { useState, useEffect } from "react";
import "../App.css";
import { fullNameRegEx, emailRegEx } from "../regex"
import { ColorRing } from "react-loader-spinner";

const serverURL = "https://frontend-take-home.fetchrewards.com/form"

interface PostResponse{
    name: string, 
    email: string,
    occupation: string,
    password: string,
    state: string,
    id: string
}

const UserForm = ()=>{
    
    //data state vars
    const [ statesDB, setStatesDB ] = useState([])
    const [ occupationsDB, setOccupationsDB ] = useState([])
    const [ postResponse, setPostResponse ] = useState<PostResponse>({
        name: "",
        email: "",
        occupation: "",
        password: "",
        state: "",
        id: ""
    })
    const [ submitSuccess, setSubmitSuccess ] = useState(false)

    //input state vars
    const [ name, setName ] = useState("")
    const [ nameErr, setNameErr ] = useState(false)
    const [ email, setEmail ] = useState("")
    const [ emailErr, setEmailErr ] = useState(false)
    const [ pass_1, setPass_1 ] = useState("")
    const [ pass_1Err, setpass_1Err ] = useState(false)
    const [ pass_2, setPass_2 ] = useState("")
    const [ pass_2Err, setpass_2Err ] = useState(false)
    const [ occupation, setOccupation ] = useState("")
    const [ state, setState] = useState("")

    //validation state vars
    const [ error, setError ] = useState({state: false, message: ""})
    const [ isLoading, setIsLoading ] = useState(false)

    //effect to sync occupations and US states
    useEffect(()=>{
        const fetchData = async ()=>{
            try{
                let response = await fetch(serverURL)
                let parsedResponse = await response.json()
                setStatesDB(parsedResponse.states)
                setOccupationsDB(parsedResponse.occupations)
            }catch(err){
                setError({state: true, message: "Unable to connect to server."})
            }
        }
        fetchData()
    }, [])

    //handler to validate some of the text inputs
    const valChangeHandler = (
        event: React.ChangeEvent<HTMLInputElement>, 
        updateFunc: React.Dispatch<React.SetStateAction<string>>,
        errorUpdateFunc: React.Dispatch<React.SetStateAction<boolean>>,
        regex: RegExp
    )=>{
        errorUpdateFunc(false)
        if(!regex.test(event.target.value)){
            errorUpdateFunc(true)
            return
        }
        updateFunc(event.target.value)
        return
    }

    //onchange to validate passwords match
    const validatePasswordMatch = (event: React.ChangeEvent<HTMLInputElement>)=>{
        setpass_2Err(false)
        if(pass_1 === ""){
            setpass_1Err(true)
            return
        }

        let passwordsMatch = pass_1 === event.target.value

        if(passwordsMatch){
            setPass_2(event.target.value)
            return
        }else{
            setpass_2Err(true)
        }
    }

    //submit handler
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault()
        //check confirm password
        if(pass_1 !== pass_2){
            setError({state: true, message: "Passwords do not match."})
            return
        }
        //last check to make sure there are no form omissions
        if(name === "" || email === "" || pass_1 === "" || occupation === "" || state === ""){
            setError({state: true, message: "Please complete the entire form."})
            return
        }
        //send request
        try{
            setIsLoading(true)
            let response = await fetch(serverURL, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: pass_1,
                    occupation: occupation,
                    state: state
                })
            })
            if(response.status !== 201){
                setError({state: true, message: "Bad response from server."})
                return
            }
            let parsedResponse = await response.json()
            setIsLoading(false)
            setPostResponse(parsedResponse)
            setSubmitSuccess(true)
        }catch(err){
            setIsLoading(false)
            setError({state: true, message: "Unable to connect to the server."})
        }
    }
    
    //page to render after successful submission
    if(submitSuccess){
        return(
            <div id="success-container">
                <h1 className="success-msg">Form successfully submitted!</h1>
                <h3>Information submitted:</h3>
                {
                    Object.keys(postResponse).map((el: string, index: number)=>{
                        return(
                            <span key={`item-${index}`}><b>{el}</b>: &nbsp;{(postResponse as any)[el]}</span>
                        )
                    })
                }
            </div>
        )
    }

    //page containing the form inputs
    return(
        <div id="user-form-container">
            <header id="form-header">
                <span>Enter your information below:</span>
                {
                    isLoading
                    ?   <ColorRing
                            visible={true}
                            height="80"
                            width="80"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperClass="blocks-wrapper"
                            colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                        />
                    :   null
                }
            </header>
            <form id="user-form" onSubmit={(e) => handleSubmit(e)}>
                <label>
                    {
                        nameErr
                        ?   <span className="error-msg">Full name is required and must be in the correct format.</span>
                        :   <span>Full name</span>
                    }
                    <input type="text" className="form-field" id="name" name="name-input" required
                        onChange={(e)=>{
                            valChangeHandler(e, setName, setNameErr, fullNameRegEx)
                        }}
                    />
                </label>
                <label>
                    {
                        emailErr
                        ?   <span className="error-msg">Email address is required and must be in format example@example.com</span>
                        :   <span>Email address</span>
                    }
                    <input type="text" className="form-field" id="email" name="email-input" required
                        onChange={(e)=>{
                            valChangeHandler(e, setEmail, setEmailErr, emailRegEx)
                        }}
                    />
                </label>
                <label>
                    {
                        pass_1Err
                        ?   <span className="error-msg">Please enter a strong password.</span>
                        :   <span>Password</span>
                    }
                    <input type="password" className="form-field" id="password-1" name="password-input" required
                        onChange={(e)=>{
                            setpass_1Err(false)
                            setPass_1(e.target.value)
                        }}
                    />
                </label>
                <label>
                    {
                        pass_2Err
                        ?   <span className="error-msg">Passwords must match.</span>
                        :   <span>Confirm password</span>
                    }
                    <input type="password" className="form-field" id="password-2" name="password-confirm" required
                        onChange={(e)=>{
                            validatePasswordMatch(e)
                        }}
                    />
                </label>
                <label>
                    Occupation
                    <select
                        onChange={(e)=>{
                            setOccupation(e.target.value)
                        }}
                    >
                        <option value=""/>
                        {
                            occupationsDB.map((el: string, index: number)=>{
                                return(
                                    <option key={`occupation-${index}`}>
                                        {el}
                                    </option>
                                )
                            })
                        }
                    </select>
                </label>
                <label>
                    State
                    <select
                        onChange={(e)=>{
                            setState(e.target.value)
                        }}
                    >
                        <option value=""/>
                        {
                            statesDB.map((el: {name: string, abbreviation: string}, index: number)=>{
                                return(
                                    <option key={`state-${index}`}>
                                        {el.name}
                                    </option>
                                )
                            })
                        }
                    </select>
                </label>
                {
                    error.state
                    ?   <span className="error-msg">{error.message}</span>
                    :   null
                }
                <input type="submit" id="submit-btn" aria-label="submit"/>
            </form>
        </div>
    )
}

export default UserForm