import React from 'react'
import "./About.css"

function AboutAbilities({typesome , Cursor ,typeEffect}) {
  return (
    <div>
          <div className="Aboutsomeglassy">
            <div className="firstchild font-semibold">
              S{typesome}
              <Cursor />
            </div>
            <div className="secondchild">
              I am a{" "}
              <span
                style={{
                  color: "#E3872D",
                }}
              >
                {typeEffect}
                <cursor />
              </span>
              , and I'm very passionate and dedicated to my work. With 3 years
              experience as a professional Web developer, I have acquired the
              skills and knowledge necessary to make your project a success. I
              enjoy every step of the design process, from discussion and
              collaboration to concept and execution, but I find the most
              satisfaction in seeing the finished product do everything for you
              that it was created to do.
            </div>
          </div>
        </div>
  )
}

export default AboutAbilities
