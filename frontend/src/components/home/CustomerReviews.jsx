import React from 'react'
import { 
  FaHeart, 
  FaPaw, 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar,
  FaDog,
  FaCat
} from 'react-icons/fa'
import { 
  RiDoubleQuotesL, 
  RiDoubleQuotesR 
} from 'react-icons/ri'
import { 
  GiRabbit,  // Icon thỏ từ Game Icons
  GiPawPrint 
} from 'react-icons/gi'

export default function CustomerReviews() {
  const reviews = [
    {
      id: 1,
      avatar: 'dog',
      name: 'Minh Anh',
      rating: 5,
      comment: 'Bé cún nhà mình rất thích món đồ chơi này, chơi suốt ngày không chán!',
      pet: 'Bé Cún (Poodle)',
      date: '2 ngày trước'
    },
    {
      id: 2,
      avatar: 'cat',
      name: 'Phương Thảo',
      rating: 5,
      comment: 'Mèo nhà mê cần câu này lắm! Lông mềm, chuông kêu vui tai.',
      pet: 'Bé Mướp (Mèo Anh)',
      date: '5 ngày trước'
    },
    {
      id: 3,
      avatar: 'dog',
      name: 'Hoàng Long',
      rating: 4,
      comment: 'Sản phẩm bền, đẹp, bé nhà mình chơi 3 tháng rồi vẫn còn tốt.',
      pet: 'Bé Bông (Golden)',
      date: '1 tuần trước'
    },
    {
      id: 4,
      avatar: 'rabbit',
      name: 'Thu Hà',
      rating: 5,
      comment: 'Shop tư vấn nhiệt tình, đóng gói cẩn thận.',
      pet: 'Bông (Thỏ)',
      date: '1 tuần trước'
    }
  ]

  const renderAvatar = (type) => {
    switch(type) {
      case 'dog':
        return <FaDog />
      case 'cat':
        return <FaCat />
      case 'rabbit':
        // Có thể chọn 1 trong các icon dưới đây
        return <GiRabbit />      // Game Icons
        // return <BsRabbitFill /> // Bootstrap Icons
      default:
        return <FaPaw />
    }
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={`star-${i}`} className="star-filled" />)
      } else if (i - 0.5 === rating) {
        stars.push(<FaStarHalfAlt key={`star-${i}`} className="star-half" />)
      } else {
        stars.push(<FaRegStar key={`star-${i}`} className="star-empty" />)
      }
    }
    return stars
  }

  return (
    <section className="customer-reviews">
      <div className="container">
        <h2 className="section-title">
          <span className="title-icon">
            <FaHeart />
          </span>
          Khách hàng nói gì về chúng tôi
          <span className="title-icon">
            <FaPaw />
          </span>
        </h2>

        <div className="reviews-grid">
          {reviews.map(review => (
            <div key={`review-${review.id}`} className="review-card">
              <div className="quote-icon">
                <RiDoubleQuotesL />
              </div>
              
              <div className="review-header">
                <div className="review-avatar">
                  {renderAvatar(review.avatar)}
                </div>
                <div className="review-info">
                  <h4 className="reviewer-name">{review.name}</h4>
                  <p className="reviewer-pet">
                    <GiPawPrint className="paw-icon" /> {review.pet}
                  </p>
                </div>
                <div className="review-date">{review.date}</div>
              </div>
              
              <div className="review-stars">
                {renderStars(review.rating)}
              </div>
              
              <p className="review-comment">
                <RiDoubleQuotesL className="quote-left" />
                {review.comment}
                <RiDoubleQuotesR className="quote-right" />
              </p>
            </div>
          ))}
        </div>

        <div className="reviews-footer">
          <button className="view-all-reviews">
            Xem tất cả đánh giá <FaStar className="star-icon" />
          </button>
        </div>
      </div>
    </section>
  )
}