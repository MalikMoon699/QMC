import React, { useState, useEffect } from "react";
import "../assets/styles/Slider.css";

const Slider = ({ slides, style }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="slider-container" style={style}>
      <button
        className="prev-btn"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
      >
        {`<`}
      </button>
      <div className="slider">
        <div
          className="slide-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div className="slide" key={index}>
              <img src={slide} alt={`Device Image ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
      <button
        className="next-btn"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
      >
        {`>`}
      </button>
      <div className="dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentSlide === index ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Slider;
