import React, { createContext, useContext, useReducer } from "react";

const DataContext = createContext();

const initialState = {
  subject: "",
  message: "",
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        subject: action.payload.subject,
        message: action.payload.message,
      };
    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const setSubjectAndMessage = (newSubject, newMessage) => {
    dispatch({
      type: "SET_DATA",
      payload: {
        subject: newSubject,
        message: newMessage,
      },
    });
  };

  return (
    <DataContext.Provider value={{ ...state, setSubjectAndMessage }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  return useContext(DataContext);
};
