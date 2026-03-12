import React from 'react'
import { 
  FaDog, 
  FaCat, 
  FaArrowRight 
} from 'react-icons/fa'
import { GiBrain, GiDogBowl, GiCat, GiTooth, GiTennisBall, GiGamepad } from 'react-icons/gi'
import { MdPets, MdToys } from 'react-icons/md'
import { IoMdFootball } from 'react-icons/io'

export default function FeaturedCategories() {
  const categories = [
    { 
      icon: <FaDog />, 
      name: 'Đồ chơi cho chó', 
      desc: 'Bóng, xương, frisbee...',
      color: '#6FD5DD',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200',
      bgColor: 'rgba(111, 213, 221, 0.1)'
    },
    { 
      icon: <FaCat />, 
      name: 'Đồ chơi cho mèo', 
      desc: 'Cần câu, chuột, bóng...',
      color: '#FFD6C0',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200',
      bgColor: 'rgba(255, 214, 192, 0.1)'
    },
    { 
      icon: <GiBrain />, 
      name: 'Đồ chơi thông minh', 
      desc: 'Phát triển trí tuệ',
      color: '#FFC94D',
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=200',
      bgColor: 'rgba(255, 201, 77, 0.1)'
    },
    { 
      icon: <GiTooth />, 
      name: 'Đồ chơi nhai', 
      desc: 'Chắc khỏe răng',
      color: '#FF8C94',
      image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=200',
      bgColor: 'rgba(255, 140, 148, 0.1)'
    },
    { 
      icon: <IoMdFootball />, 
      name: 'Đồ chơi vận động', 
      desc: 'Năng động, khỏe mạnh',
      color: '#6FD5DD',
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=200',
      bgColor: 'rgba(111, 213, 221, 0.1)'
    },
    { 
      icon: <GiGamepad />, 
      name: 'Đồ chơi tương tác', 
      desc: 'Gắn kết yêu thương',
      color: '#FFD6C0',
      image: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=200',
      bgColor: 'rgba(255, 214, 192, 0.1)'
    }
  ]

  return (
    <section className="featured-categories">
      <div className="container">
        <h2 className="section-title">
          <span className="title-icon">
            <MdPets />
          </span>
          Danh mục nổi bật
          <span className="title-icon">
            <MdToys />
          </span>
        </h2>
        
        <div className="categories-grid">
          {categories.map((cat, index) => (
            <div 
              key={index} 
              className="category-card"
              onClick={() => window.location.href = `/category/${cat.name}`}
              style={{ 
                '--category-color': cat.color,
                backgroundColor: cat.bgColor 
              }}
            >
              <div className="category-image-wrapper">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="category-image"
                  loading="lazy"
                />
                <div 
                  className="category-icon-large"
                  style={{ color: cat.color }}
                >
                  {cat.icon}
                </div>
              </div>
              
              <h3 className="category-name">{cat.name}</h3>
              <p className="category-desc">{cat.desc}</p>
              
              <span className="category-link">
                Xem thêm 
                <FaArrowRight className="arrow-icon" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}