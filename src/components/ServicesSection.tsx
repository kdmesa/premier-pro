import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import styles from '../styles/ServicesSection.module.css';

const services = [
  {
    title: 'Residential Cleaning',
    description: 'Professional home cleaning services to keep your living space spotless and fresh.',
    features: ['Regular cleaning', 'Deep cleaning', 'Move-in/out cleaning', 'Custom services'],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop'
  },
  {
    title: 'Commercial Cleaning',
    description: 'Maintain a clean and professional workspace with our commercial cleaning solutions.',
    features: ['Office cleaning', 'Retail spaces', 'Medical facilities', 'Industrial cleaning'],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'
  },
  {
    title: 'Specialty Services',
    description: 'Specialized cleaning services for your unique needs.',
    features: ['Carpet cleaning', 'Window washing', 'Upholstery cleaning', 'Disinfection'],
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop'
  },
  {
    title: 'Post-Construction Cleaning',
    description: 'Thorough cleaning after renovation or construction projects.',
    features: ['Dust removal', 'Debris cleanup', 'Surface polishing', 'Final touch-ups'],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop'
  },
  {
    title: 'Green Eco-Friendly Cleaning',
    description: 'Environmentally safe cleaning using eco-friendly products and methods.',
    features: ['Non-toxic products', 'Sustainable practices', 'Safe for pets & kids', 'Allergen-free'],
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop'
  },
  {
    title: 'Event Cleaning Services',
    description: 'Pre and post-event cleaning for parties, weddings, and corporate events.',
    features: ['Setup cleaning', 'During event support', 'Post-event cleanup', 'Waste management'],
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop'
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className={`py-16 bg-gray-50 relative ${styles.servicesSection}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Our Services</h2>
          <p>Professional cleaning services tailored to your needs</p>
        </div>
        
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div key={index} className={styles.serviceCard}>
              <div className={styles.serviceImageWrapper}>
                <img 
                  src={service.image} 
                  alt={service.title}
                  className={styles.serviceCardImage}
                  loading="lazy"
                />
              </div>
              <div className={styles.serviceCardContent}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul className={styles.featuresList}>
                  {service.features.map((feature, i) => (
                    <li key={i}>
                      <CheckCircle2 className={styles.checkIcon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
